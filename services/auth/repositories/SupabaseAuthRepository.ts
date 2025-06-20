import { supabase } from '@/lib/supabase';
import { IAuthRepository } from '../interfaces/IAuthRepository';
import { 
  User, 
  SignInData, 
  SignUpData, 
  AuthSession, 
  AuthTokens,
  AuthError,
  AuthErrorCode,
  DeviceInfo
} from '@/types/auth';
import { AuthValidator } from '../validators/AuthValidator';
import { SecurityService } from '../security/SecurityService';
import { logger } from '@/utils/logger';

/**
 * Supabase implementation of the authentication repository
 * Handles all authentication operations with Supabase backend
 */
export class SupabaseAuthRepository implements IAuthRepository {
  private securityService: SecurityService;
  private validator: AuthValidator;

  constructor() {
    this.securityService = new SecurityService();
    this.validator = new AuthValidator();
  }

  async signIn(data: SignInData): Promise<AuthSession> {
    try {
      // Validate input
      this.validator.validateSignInData(data);

      // Check login attempts for rate limiting
      const attempts = await this.checkLoginAttempts(data.email);
      if (attempts.lockedUntil && attempts.lockedUntil > new Date()) {
        throw new AuthError(
          AuthErrorCode.ACCOUNT_LOCKED,
          `Account locked until ${attempts.lockedUntil.toLocaleString()}`
        );
      }

      // Attempt sign in with retry logic
      const { data: authData, error } = await this.retryableOperation(
        () => supabase.auth.signInWithPassword({
          email: data.email.trim().toLowerCase(),
          password: data.password,
        })
      );

      if (error) {
        await this.recordLoginAttempt(data.email, false);
        throw this.mapSupabaseError(error);
      }

      if (!authData.user || !authData.session) {
        throw new AuthError(
          AuthErrorCode.INVALID_CREDENTIALS,
          'Invalid email or password'
        );
      }

      // Record successful login
      await this.recordLoginAttempt(data.email, true);

      // Get user profile
      const user = await this.getUserProfile(authData.user.id);

      // Update last login
      await this.updateLastLogin(authData.user.id);

      // Create session object
      const session: AuthSession = {
        user,
        tokens: {
          accessToken: authData.session.access_token,
          refreshToken: authData.session.refresh_token,
          expiresIn: authData.session.expires_in || 3600,
          tokenType: 'Bearer',
        },
        sessionId: authData.session.access_token, // Using token as session ID for now
        deviceInfo: data.deviceInfo,
      };

      logger.info('User signed in successfully', { userId: user.id });
      return session;

    } catch (error) {
      logger.error('Sign in failed', { error, email: data.email });
      throw error instanceof AuthError ? error : this.mapError(error);
    }
  }

  async signUp(data: SignUpData): Promise<AuthSession> {
    try {
      // Validate input
      this.validator.validateSignUpData(data);

      // Check if email already exists
      const existingUser = await this.checkEmailExists(data.email);
      if (existingUser) {
        throw new AuthError(
          AuthErrorCode.EMAIL_ALREADY_EXISTS,
          'An account with this email already exists'
        );
      }

      // Sign up with Supabase
      const { data: authData, error } = await supabase.auth.signUp({
        email: data.email.trim().toLowerCase(),
        password: data.password,
        options: {
          data: {
            full_name: data.fullName,
            phone_number: data.phoneNumber,
            role: data.role,
            accepted_terms: data.acceptedTerms,
            marketing_consent: data.marketingConsent,
          },
        },
      });

      if (error) {
        throw this.mapSupabaseError(error);
      }

      if (!authData.user) {
        throw new AuthError(
          AuthErrorCode.UNKNOWN_ERROR,
          'Failed to create account'
        );
      }

      // Create user profile in database
      const profile = await this.createUserProfile({
        id: authData.user.id,
        email: authData.user.email!,
        fullName: data.fullName,
        phoneNumber: data.phoneNumber,
        role: data.role,
      });

      // Create session if auto-confirmed
      if (authData.session) {
        return {
          user: profile,
          tokens: {
            accessToken: authData.session.access_token,
            refreshToken: authData.session.refresh_token,
            expiresIn: authData.session.expires_in || 3600,
            tokenType: 'Bearer',
          },
          sessionId: authData.session.access_token,
        };
      }

      // Return partial session for email verification flow
      return {
        user: profile,
        tokens: {
          accessToken: '',
          refreshToken: '',
          expiresIn: 0,
          tokenType: 'Bearer',
        },
        sessionId: '',
      };

    } catch (error) {
      logger.error('Sign up failed', { error, email: data.email });
      throw error instanceof AuthError ? error : this.mapError(error);
    }
  }

  async signOut(sessionId?: string): Promise<void> {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        throw this.mapSupabaseError(error);
      }
      logger.info('User signed out successfully');
    } catch (error) {
      logger.error('Sign out failed', { error });
      throw error instanceof AuthError ? error : this.mapError(error);
    }
  }

  async getCurrentSession(): Promise<AuthSession | null> {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error || !session) {
        return null;
      }

      const user = await this.getUserProfile(session.user.id);

      return {
        user,
        tokens: {
          accessToken: session.access_token,
          refreshToken: session.refresh_token,
          expiresIn: session.expires_in || 3600,
          tokenType: 'Bearer',
        },
        sessionId: session.access_token,
      };

    } catch (error) {
      logger.error('Failed to get current session', { error });
      return null;
    }
  }

  async refreshSession(refreshToken: string): Promise<AuthTokens> {
    try {
      const { data, error } = await supabase.auth.refreshSession({
        refresh_token: refreshToken,
      });

      if (error || !data.session) {
        throw new AuthError(
          AuthErrorCode.REFRESH_TOKEN_EXPIRED,
          'Refresh token expired or invalid'
        );
      }

      return {
        accessToken: data.session.access_token,
        refreshToken: data.session.refresh_token,
        expiresIn: data.session.expires_in || 3600,
        tokenType: 'Bearer',
      };

    } catch (error) {
      logger.error('Failed to refresh session', { error });
      throw error instanceof AuthError ? error : this.mapError(error);
    }
  }

  async validateSession(sessionId: string): Promise<boolean> {
    try {
      const { data: { user }, error } = await supabase.auth.getUser(sessionId);
      return !error && !!user;
    } catch {
      return false;
    }
  }

  async revokeSession(sessionId: string): Promise<void> {
    // Supabase doesn't support explicit session revocation
    // This would be implemented with a custom session management table
    logger.warn('Session revocation not implemented for Supabase');
  }

  async getUserProfile(userId: string): Promise<User> {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      if (error || !data) {
        throw new AuthError(
          AuthErrorCode.USER_NOT_FOUND,
          'User profile not found'
        );
      }

      return this.mapUserFromDatabase(data);

    } catch (error) {
      logger.error('Failed to get user profile', { error, userId });
      throw error instanceof AuthError ? error : this.mapError(error);
    }
  }

  async updateUserProfile(userId: string, updates: Partial<User>): Promise<User> {
    try {
      const updateData = this.mapUserToDatabase(updates);
      
      const { data, error } = await supabase
        .from('users')
        .update({
          ...updateData,
          updated_at: new Date().toISOString(),
        })
        .eq('id', userId)
        .select()
        .single();

      if (error || !data) {
        throw new AuthError(
          AuthErrorCode.USER_NOT_FOUND,
          'Failed to update user profile'
        );
      }

      return this.mapUserFromDatabase(data);

    } catch (error) {
      logger.error('Failed to update user profile', { error, userId });
      throw error instanceof AuthError ? error : this.mapError(error);
    }
  }

  async deleteAccount(userId: string): Promise<void> {
    try {
      // Soft delete user profile
      const { error } = await supabase
        .from('users')
        .update({ 
          deleted_at: new Date().toISOString(),
          email: `deleted_${userId}@deleted.com`, // Anonymize email
        })
        .eq('id', userId);

      if (error) {
        throw this.mapSupabaseError(error);
      }

      // Delete auth user
      const { error: authError } = await supabase.auth.admin.deleteUser(userId);
      if (authError) {
        throw this.mapSupabaseError(authError);
      }

      logger.info('User account deleted', { userId });

    } catch (error) {
      logger.error('Failed to delete account', { error, userId });
      throw error instanceof AuthError ? error : this.mapError(error);
    }
  }

  async resetPassword(email: string): Promise<void> {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${process.env.EXPO_PUBLIC_APP_URL}/reset-password`,
      });

      if (error) {
        throw this.mapSupabaseError(error);
      }

      logger.info('Password reset email sent', { email });

    } catch (error) {
      logger.error('Failed to send password reset email', { error, email });
      throw error instanceof AuthError ? error : this.mapError(error);
    }
  }

  async updatePassword(userId: string, currentPassword: string, newPassword: string): Promise<void> {
    try {
      // Validate new password
      this.validator.validatePassword(newPassword);

      // Verify current password first
      const { data: { user } } = await supabase.auth.getUser();
      if (!user || user.id !== userId) {
        throw new AuthError(
          AuthErrorCode.INVALID_TOKEN,
          'Invalid user session'
        );
      }

      // Update password
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) {
        throw this.mapSupabaseError(error);
      }

      logger.info('Password updated successfully', { userId });

    } catch (error) {
      logger.error('Failed to update password', { error, userId });
      throw error instanceof AuthError ? error : this.mapError(error);
    }
  }

  async sendVerificationEmail(email: string): Promise<void> {
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email,
      });

      if (error) {
        throw this.mapSupabaseError(error);
      }

      logger.info('Verification email sent', { email });

    } catch (error) {
      logger.error('Failed to send verification email', { error, email });
      throw error instanceof AuthError ? error : this.mapError(error);
    }
  }

  async verifyEmail(token: string): Promise<void> {
    try {
      const { error } = await supabase.auth.verifyOtp({
        token_hash: token,
        type: 'email',
      });

      if (error) {
        throw this.mapSupabaseError(error);
      }

      logger.info('Email verified successfully');

    } catch (error) {
      logger.error('Failed to verify email', { error });
      throw error instanceof AuthError ? error : this.mapError(error);
    }
  }

  async getDevices(userId: string): Promise<DeviceInfo[]> {
    // This would be implemented with a custom devices table
    logger.warn('Device management not implemented for Supabase');
    return [];
  }

  async removeDevice(userId: string, deviceId: string): Promise<void> {
    // This would be implemented with a custom devices table
    logger.warn('Device management not implemented for Supabase');
  }

  async checkLoginAttempts(email: string): Promise<{ attempts: number; lockedUntil?: Date }> {
    try {
      const { data } = await supabase
        .from('login_attempts')
        .select('*')
        .eq('email', email.toLowerCase())
        .single();

      if (!data) {
        return { attempts: 0 };
      }

      return {
        attempts: data.attempts,
        lockedUntil: data.locked_until ? new Date(data.locked_until) : undefined,
      };

    } catch {
      return { attempts: 0 };
    }
  }

  async recordLoginAttempt(email: string, success: boolean): Promise<void> {
    try {
      if (success) {
        // Reset attempts on successful login
        await supabase
          .from('login_attempts')
          .upsert({
            email: email.toLowerCase(),
            attempts: 0,
            last_attempt: new Date().toISOString(),
            locked_until: null,
          });
      } else {
        // Increment attempts and potentially lock account
        const { data: current } = await supabase
          .from('login_attempts')
          .select('attempts')
          .eq('email', email.toLowerCase())
          .single();

        const attempts = (current?.attempts || 0) + 1;
        const maxAttempts = this.securityService.getSecurityConfig().maxLoginAttempts;
        
        const lockUntil = attempts >= maxAttempts
          ? new Date(Date.now() + this.securityService.getSecurityConfig().lockoutDuration * 60 * 1000)
          : null;

        await supabase
          .from('login_attempts')
          .upsert({
            email: email.toLowerCase(),
            attempts,
            last_attempt: new Date().toISOString(),
            locked_until: lockUntil?.toISOString(),
          });
      }
    } catch (error) {
      logger.error('Failed to record login attempt', { error, email });
    }
  }

  // Private helper methods

  private async retryableOperation<T>(
    operation: () => Promise<T>,
    maxRetries: number = 3
  ): Promise<T> {
    let lastError: any;
    
    for (let i = 0; i < maxRetries; i++) {
      try {
        return await operation();
      } catch (error: any) {
        lastError = error;
        
        if (i < maxRetries - 1 && this.isRetryableError(error)) {
          await new Promise(resolve => setTimeout(resolve, Math.pow(2, i) * 1000));
          continue;
        }
        
        throw error;
      }
    }
    
    throw lastError;
  }

  private isRetryableError(error: any): boolean {
    return error?.message?.includes('Network request failed') ||
           error?.message?.includes('fetch') ||
           error?.status >= 500;
  }

  private async checkEmailExists(email: string): Promise<boolean> {
    const { data } = await supabase
      .from('users')
      .select('id')
      .eq('email', email.toLowerCase())
      .single();
    
    return !!data;
  }

  private async createUserProfile(userData: {
    id: string;
    email: string;
    fullName: string;
    phoneNumber?: string;
    role: string;
  }): Promise<User> {
    const { data, error } = await supabase
      .from('users')
      .insert({
        id: userData.id,
        email: userData.email,
        full_name: userData.fullName,
        phone_number: userData.phoneNumber,
        role: userData.role,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error || !data) {
      throw new AuthError(
        AuthErrorCode.UNKNOWN_ERROR,
        'Failed to create user profile'
      );
    }

    return this.mapUserFromDatabase(data);
  }

  private async updateLastLogin(userId: string): Promise<void> {
    await supabase
      .from('users')
      .update({ last_login_at: new Date().toISOString() })
      .eq('id', userId);
  }

  private mapUserFromDatabase(data: any): User {
    return {
      id: data.id,
      email: data.email,
      fullName: data.full_name,
      phoneNumber: data.phone_number,
      role: data.role,
      avatar: data.avatar_url,
      emailVerified: data.email_verified,
      phoneVerified: data.phone_verified,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
      lastLoginAt: data.last_login_at,
      preferences: data.preferences,
      metadata: data.metadata,
    };
  }

  private mapUserToDatabase(user: Partial<User>): any {
    const data: any = {};
    
    if (user.fullName !== undefined) data.full_name = user.fullName;
    if (user.phoneNumber !== undefined) data.phone_number = user.phoneNumber;
    if (user.role !== undefined) data.role = user.role;
    if (user.avatar !== undefined) data.avatar_url = user.avatar;
    if (user.emailVerified !== undefined) data.email_verified = user.emailVerified;
    if (user.phoneVerified !== undefined) data.phone_verified = user.phoneVerified;
    if (user.preferences !== undefined) data.preferences = user.preferences;
    if (user.metadata !== undefined) data.metadata = user.metadata;
    
    return data;
  }

  private mapSupabaseError(error: any): AuthError {
    const message = error.message || 'An error occurred';
    
    if (message.includes('Invalid login credentials')) {
      return new AuthError(AuthErrorCode.INVALID_CREDENTIALS, 'Invalid email or password');
    }
    
    if (message.includes('Email not confirmed')) {
      return new AuthError(AuthErrorCode.EMAIL_NOT_VERIFIED, 'Please verify your email before signing in');
    }
    
    if (message.includes('already registered')) {
      return new AuthError(AuthErrorCode.EMAIL_ALREADY_EXISTS, 'An account with this email already exists');
    }
    
    if (message.includes('Network request failed')) {
      return new AuthError(AuthErrorCode.NETWORK_ERROR, 'Network connection failed. Please check your internet connection.');
    }
    
    if (error.status >= 500) {
      return new AuthError(AuthErrorCode.SERVER_ERROR, 'Server error. Please try again later.');
    }
    
    return new AuthError(AuthErrorCode.UNKNOWN_ERROR, message, error);
  }

  private mapError(error: any): AuthError {
    if (error instanceof AuthError) {
      return error;
    }
    
    return new AuthError(
      AuthErrorCode.UNKNOWN_ERROR,
      error?.message || 'An unexpected error occurred',
      error
    );
  }
}
