import { IAuthRepository } from '../interfaces/IAuthRepository';
import { supabase } from '@/lib/supabase';
import {
  User,
  SignInData,
  SignUpData,
  AuthTokens,
  AuthSession,
  AuthError,
  AuthErrorCode,
} from '@/types/auth';
import { logger } from '@/utils/logger';
import { ApiDebugger } from '@/utils/api/apiDebugger';
import { NetworkUtils } from '@/utils/network/networkUtils';

/**
 * Enhanced Supabase authentication repository with comprehensive error handling
 */
export class EnhancedSupabaseAuthRepository implements IAuthRepository {
  /**
   * Sign in with enhanced error handling and debugging
   */
  async signIn(data: SignInData): Promise<AuthSession> {
    const requestId = `auth_signin_${Date.now()}`;
    
    try {
      logger.info(`[${requestId}] Starting sign in process`, {
        email: data.email,
        timestamp: new Date().toISOString(),
      });

      // Check network connectivity
      const isConnected = await NetworkUtils.isConnected();
      if (!isConnected) {
        throw new AuthError(
          AuthErrorCode.NETWORK_ERROR,
          'No internet connection available'
        );
      }

      // Log the request details
      ApiDebugger.logRequest(
        `${supabase.supabaseUrl}/auth/v1/token`,
        'POST',
        { 'Content-Type': 'application/json' },
        { email: data.email, password: '***' }
      );

      // Attempt sign in with detailed error catching
      const { data: authData, error } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      });

      if (error) {
        logger.error(`[${requestId}] Supabase sign in error`, {
          error: {
            message: error.message,
            status: error.status,
            code: error.code,
            details: error,
          },
          networkInfo: await NetworkUtils.getNetworkInfo(),
        });

        // Map Supabase errors to our error types
        if (error.message.includes('Network request failed')) {
          throw new AuthError(
            AuthErrorCode.NETWORK_ERROR,
            'Network request failed. Please check your internet connection and try again.'
          );
        }

        if (error.status === 400) {
          throw new AuthError(
            AuthErrorCode.INVALID_CREDENTIALS,
            'Invalid email or password'
          );
        }

        throw new AuthError(
          AuthErrorCode.UNKNOWN_ERROR,
          error.message || 'Sign in failed'
        );
      }

      if (!authData.user || !authData.session) {
        throw new AuthError(
          AuthErrorCode.UNKNOWN_ERROR,
          'Sign in succeeded but no user data returned'
        );
      }

      logger.info(`[${requestId}] Sign in successful`, {
        userId: authData.user.id,
        email: authData.user.email,
      });

      // Convert to our auth session format
      const session: AuthSession = {
        user: this.mapSupabaseUser(authData.user),
        tokens: {
          accessToken: authData.session.access_token,
          refreshToken: authData.session.refresh_token,
          expiresIn: authData.session.expires_in || 3600,
        },
        sessionId: authData.session.access_token,
      };

      return session;

    } catch (error) {
      // Log comprehensive error details
      await ApiDebugger.logError(requestId, error as Error, {
        url: `${supabase.supabaseUrl}/auth/v1/token`,
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: { email: data.email },
      });

      if (error instanceof AuthError) {
        throw error;
      }

      logger.error(`[${requestId}] Unexpected error during sign in`, {
        error: error instanceof Error ? {
          name: error.name,
          message: error.message,
          stack: error.stack,
        } : error,
      });

      throw new AuthError(
        AuthErrorCode.UNKNOWN_ERROR,
        'An unexpected error occurred during sign in'
      );
    }
  }

  /**
   * Sign up with enhanced error handling
   */
  async signUp(data: SignUpData): Promise<AuthSession> {
    const requestId = `auth_signup_${Date.now()}`;
    
    try {
      logger.info(`[${requestId}] Starting sign up process`, {
        email: data.email,
        role: data.role,
        timestamp: new Date().toISOString(),
      });

      // Check network connectivity
      const isConnected = await NetworkUtils.isConnected();
      if (!isConnected) {
        throw new AuthError(
          AuthErrorCode.NETWORK_ERROR,
          'No internet connection available'
        );
      }

      // Log the request
      ApiDebugger.logRequest(
        `${supabase.supabaseUrl}/auth/v1/signup`,
        'POST',
        { 'Content-Type': 'application/json' },
        {
          email: data.email,
          password: '***',
          data: {
            full_name: data.fullName,
            phone_number: data.phoneNumber,
            role: data.role,
          },
        }
      );

      // Attempt sign up
      const { data: authData, error } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            full_name: data.fullName,
            phone_number: data.phoneNumber,
            role: data.role,
          },
        },
      });

      if (error) {
        logger.error(`[${requestId}] Supabase sign up error`, {
          error: {
            message: error.message,
            status: error.status,
            code: error.code,
            details: error,
          },
          networkInfo: await NetworkUtils.getNetworkInfo(),
        });

        if (error.message.includes('Network request failed')) {
          throw new AuthError(
            AuthErrorCode.NETWORK_ERROR,
            'Network request failed. Please check your internet connection and try again.'
          );
        }

        if (error.message.includes('already registered')) {
          throw new AuthError(
            AuthErrorCode.USER_EXISTS,
            'An account with this email already exists'
          );
        }

        throw new AuthError(
          AuthErrorCode.UNKNOWN_ERROR,
          error.message || 'Sign up failed'
        );
      }

      if (!authData.user) {
        throw new AuthError(
          AuthErrorCode.UNKNOWN_ERROR,
          'Sign up succeeded but no user data returned'
        );
      }

      logger.info(`[${requestId}] Sign up successful`, {
        userId: authData.user.id,
        email: authData.user.email,
        emailConfirmed: authData.user.email_confirmed_at != null,
      });

      // If session exists (auto-confirmed), return full session
      if (authData.session) {
        return {
          user: this.mapSupabaseUser(authData.user),
          tokens: {
            accessToken: authData.session.access_token,
            refreshToken: authData.session.refresh_token,
            expiresIn: authData.session.expires_in || 3600,
          },
          sessionId: authData.session.access_token,
        };
      }

      // Return partial session for unconfirmed users
      return {
        user: this.mapSupabaseUser(authData.user),
        tokens: {
          accessToken: '',
          refreshToken: '',
          expiresIn: 0,
        },
        sessionId: '',
      };

    } catch (error) {
      await ApiDebugger.logError(requestId, error as Error, {
        url: `${supabase.supabaseUrl}/auth/v1/signup`,
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: { email: data.email, role: data.role },
      });

      if (error instanceof AuthError) {
        throw error;
      }

      logger.error(`[${requestId}] Unexpected error during sign up`, {
        error: error instanceof Error ? {
          name: error.name,
          message: error.message,
          stack: error.stack,
        } : error,
      });

      throw new AuthError(
        AuthErrorCode.UNKNOWN_ERROR,
        'An unexpected error occurred during sign up'
      );
    }
  }

  /**
   * Sign out with error handling
   */
  async signOut(sessionId: string): Promise<void> {
    try {
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        logger.error('Sign out error', { error });
        throw new AuthError(
          AuthErrorCode.UNKNOWN_ERROR,
          'Failed to sign out'
        );
      }
    } catch (error) {
      logger.error('Sign out failed', { error });
      throw error instanceof AuthError ? error : new AuthError(
        AuthErrorCode.UNKNOWN_ERROR,
        'Sign out failed'
      );
    }
  }

  /**
   * Get current session with error handling
   */
  async getCurrentSession(): Promise<AuthSession | null> {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        logger.error('Get session error', { error });
        return null;
      }

      if (!session) {
        return null;
      }

      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        return null;
      }

      return {
        user: this.mapSupabaseUser(user),
        tokens: {
          accessToken: session.access_token,
          refreshToken: session.refresh_token,
          expiresIn: session.expires_in || 3600,
        },
        sessionId: session.access_token,
      };
    } catch (error) {
      logger.error('Failed to get current session', { error });
      return null;
    }
  }

  /**
   * Refresh session with error handling
   */
  async refreshSession(refreshToken: string): Promise<AuthTokens> {
    try {
      const { data, error } = await supabase.auth.refreshSession({
        refresh_token: refreshToken,
      });

      if (error) {
        logger.error('Refresh session error', { error });
        
        if (error.message.includes('refresh_token_not_found')) {
          throw new AuthError(
            AuthErrorCode.REFRESH_TOKEN_EXPIRED,
            'Refresh token expired'
          );
        }

        throw new AuthError(
          AuthErrorCode.UNKNOWN_ERROR,
          'Failed to refresh session'
        );
      }

      if (!data.session) {
        throw new AuthError(
          AuthErrorCode.UNKNOWN_ERROR,
          'No session returned after refresh'
        );
      }

      return {
        accessToken: data.session.access_token,
        refreshToken: data.session.refresh_token,
        expiresIn: data.session.expires_in || 3600,
      };
    } catch (error) {
      logger.error('Failed to refresh session', { error });
      throw error instanceof AuthError ? error : new AuthError(
        AuthErrorCode.UNKNOWN_ERROR,
        'Failed to refresh session'
      );
    }
  }

  /**
   * Update user profile
   */
  async updateUserProfile(userId: string, updates: Partial<User>): Promise<User> {
    try {
      const { data, error } = await supabase.auth.updateUser({
        data: {
          full_name: updates.fullName,
          phone_number: updates.phoneNumber,
        },
      });

      if (error) {
        logger.error('Update profile error', { error });
        throw new AuthError(
          AuthErrorCode.UNKNOWN_ERROR,
          'Failed to update profile'
        );
      }

      if (!data.user) {
        throw new AuthError(
          AuthErrorCode.UNKNOWN_ERROR,
          'No user data returned after update'
        );
      }

      return this.mapSupabaseUser(data.user);
    } catch (error) {
      logger.error('Failed to update profile', { error });
      throw error instanceof AuthError ? error : new AuthError(
        AuthErrorCode.UNKNOWN_ERROR,
        'Failed to update profile'
      );
    }
  }

  /**
   * Reset password
   */
  async resetPassword(email: string): Promise<void> {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email);
      
      if (error) {
        logger.error('Reset password error', { error });
        throw new AuthError(
          AuthErrorCode.UNKNOWN_ERROR,
          'Failed to send reset password email'
        );
      }
    } catch (error) {
      logger.error('Failed to reset password', { error });
      throw error instanceof AuthError ? error : new AuthError(
        AuthErrorCode.UNKNOWN_ERROR,
        'Failed to send reset password email'
      );
    }
  }

  /**
   * Update password
   */
  async updatePassword(
    userId: string,
    currentPassword: string,
    newPassword: string
  ): Promise<void> {
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) {
        logger.error('Update password error', { error });
        throw new AuthError(
          AuthErrorCode.UNKNOWN_ERROR,
          'Failed to update password'
        );
      }
    } catch (error) {
      logger.error('Failed to update password', { error });
      throw error instanceof AuthError ? error : new AuthError(
        AuthErrorCode.UNKNOWN_ERROR,
        'Failed to update password'
      );
    }
  }

  /**
   * Map Supabase user to our User type
   */
  private mapSupabaseUser(supabaseUser: any): User {
    return {
      id: supabaseUser.id,
      email: supabaseUser.email!,
      fullName: supabaseUser.user_metadata?.full_name || '',
      phoneNumber: supabaseUser.user_metadata?.phone_number || '',
      role: supabaseUser.user_metadata?.role || 'customer',
      emailVerified: !!supabaseUser.email_confirmed_at,
      createdAt: supabaseUser.created_at,
      updatedAt: supabaseUser.updated_at,
    };
  }
}
