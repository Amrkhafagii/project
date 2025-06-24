import { 
  User, 
  SignInData, 
  SignUpData, 
  AuthSession,
  AuthTokens,
  AuthError,
  AuthErrorCode
} from '@/types/auth';
import { IAuthRepository } from '../interfaces/IAuthRepository';
import { supabase } from '@/services/supabase';
import { logger } from '@/utils/logger';
import { checkNetworkConnectivity } from '@/utils/network/networkUtils';


/**
 * Supabase implementation of the authentication repository
 */
export class SupabaseAuthRepository implements IAuthRepository {
  async signIn(data: SignInData): Promise<AuthSession> {
    try {
      const { data: authData, error } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      });

      if (error) {
        throw this.mapSupabaseError(error);
      }

      if (!authData.session || !authData.user) {
        throw new AuthError(
          AuthErrorCode.INVALID_CREDENTIALS,
          'Invalid login credentials'
        );
      }

      return this.mapToAuthSession(authData.session, authData.user);
    } catch (error) {
      logger.error('Repository signIn error', { error });
      throw error instanceof AuthError ? error : new AuthError(
        AuthErrorCode.UNKNOWN_ERROR,
        'Failed to sign in'
      );
    }
  }

  async signUp(data: SignUpData): Promise<AuthSession> {
    try {
      // Check network connectivity first
      const networkState = await NetInfo.fetch();
      
      if (!networkState.isConnected) {
        throw new AuthError(
          AuthErrorCode.NETWORK_ERROR,
          'No network connection available. Please check your connection.'
        );
      }
  
      if (!networkState.isInternetReachable) {
        throw new AuthError(
          AuthErrorCode.NETWORK_ERROR,
          'Network is connected but internet is not reachable'
        );
      }
  
      // Proceed with Supabase signup
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
        throw this.mapSupabaseError(error);
      }
  
      if (!authData.user) {
        throw new AuthError(
          AuthErrorCode.SIGNUP_FAILED,
          'Failed to create account'
        );
      }
  
      // Create profile in separate table
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          user_id: authData.user.id,
          full_name: data.fullName,
          phone: data.phoneNumber,
          role: data.role,
          onboarded: false,
        });
  
      if (profileError) {
        logger.error('Profile creation error', { 
          profileError, 
          userId: authData.user.id 
        });
  
        // Attempt to delete the auth user if profile creation fails
        try {
          if (supabase.auth.admin?.deleteUser) {
            await supabase.auth.admin.deleteUser(authData.user.id);
          }
        } catch (rollbackError) {
          logger.error('Failed to rollback user creation', { 
            rollbackError 
          });
        }
  
        throw new AuthError(
          AuthErrorCode.PROFILE_CREATION_FAILED,
          `Failed to create user profile: ${profileError.message}`
        );
      }
  
      // Handle email confirmation case
      if (!authData.session) {
        return {
          sessionId: authData.user.id,
          user: await this.mapToUser(authData.user),
          tokens: {
            accessToken: '',
            refreshToken: '',
            expiresIn: 0,
          },
        };
      }
  
      // Return full session if email confirmation not required
      return this.mapToAuthSession(authData.session, authData.user);
      
    } catch (error) {
      logger.error('Repository signUp error', { 
        error,
        email: data.email,
        role: data.role 
      });
      
      if (error instanceof AuthError) {
        throw error;
      }
      
      // Handle unexpected errors
      if (error instanceof Error) {
        throw new AuthError(
          AuthErrorCode.UNKNOWN_ERROR,
          error.message
        );
      }
      
      throw new AuthError(
        AuthErrorCode.UNKNOWN_ERROR,
        'An unexpected error occurred during sign up'
      );
    }
  }

  async signOut(sessionId: string): Promise<void> {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        throw this.mapSupabaseError(error);
      }
    } catch (error) {
      logger.error('Repository signOut error', { error, sessionId });
      throw error instanceof AuthError ? error : new AuthError(
        AuthErrorCode.UNKNOWN_ERROR,
        'Failed to sign out'
      );
    }
  }

  async getCurrentSession(): Promise<AuthSession | null> {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        throw this.mapSupabaseError(error);
      }

      if (!session) {
        return null;
      }

      const user = await this.getUserById(session.user.id);
      if (!user) {
        return null;
      }

      return this.mapToAuthSession(session, session.user, user);
    } catch (error) {
      logger.error('Repository getCurrentSession error', { error });
      return null;
    }
  }

  async refreshSession(refreshToken: string): Promise<AuthTokens> {
    try {
      const { data, error } = await supabase.auth.refreshSession({
        refresh_token: refreshToken,
      });

      if (error) {
        throw this.mapSupabaseError(error);
      }

      if (!data.session) {
        throw new AuthError(
          AuthErrorCode.REFRESH_TOKEN_EXPIRED,
          'Refresh token expired'
        );
      }

      return {
        accessToken: data.session.access_token,
        refreshToken: data.session.refresh_token,
        expiresIn: data.session.expires_in || 3600,
      };
    } catch (error) {
      logger.error('Repository refreshSession error', { error });
      throw error instanceof AuthError ? error : new AuthError(
        AuthErrorCode.UNKNOWN_ERROR,
        'Failed to refresh session'
      );
    }
  }

  async getUserById(userId: string): Promise<User | null> {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)  // Changed from 'id' to 'user_id'
        .single();

      if (error || !data) {
        return null;
      }

      // Get email from auth.users table since it's not in profiles
      const { data: authUser } = await supabase.auth.admin?.getUser?.(userId) || 
        await supabase.auth.getUser();

      const email = authUser?.user?.email || '';

      return {
        id: data.user_id,
        email: email,
        role: data.role || 'customer',
        fullName: data.full_name || '',
        phoneNumber: data.phone || '',
        emailVerified: true, // Supabase handles this
        createdAt: data.created_at,
        updatedAt: data.updated_at,
      };
    } catch (error) {
      logger.error('Repository getUserById error', { error, userId });
      return null;
    }
  }

  async updateUserProfile(userId: string, updates: Partial<User>): Promise<User> {
    try {
      const updateData: any = {};
      if (updates.fullName !== undefined) updateData.full_name = updates.fullName;
      if (updates.phoneNumber !== undefined) updateData.phone = updates.phoneNumber;
      if (updates.role !== undefined) updateData.role = updates.role;

      const { data, error } = await supabase
        .from('profiles')
        .update(updateData)
        .eq('user_id', userId)  // Changed from 'id' to 'user_id'
        .select()
        .single();

      if (error) {
        throw new AuthError(
          AuthErrorCode.UPDATE_FAILED,
          'Failed to update profile'
        );
      }

      // Get email from auth.users table
      const { data: authUser } = await supabase.auth.getUser();
      const email = authUser?.user?.email || '';

      return {
        id: data.user_id,
        email: email,
        role: data.role,
        fullName: data.full_name,
        phoneNumber: data.phone,
        emailVerified: true,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
      };
    } catch (error) {
      logger.error('Repository updateUserProfile error', { error, userId });
      throw error instanceof AuthError ? error : new AuthError(
        AuthErrorCode.UNKNOWN_ERROR,
        'Failed to update profile'
      );
    }
  }

  async resetPassword(email: string): Promise<void> {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: 'zenithapp://reset-password',
      });

      if (error) {
        throw this.mapSupabaseError(error);
      }
    } catch (error) {
      logger.error('Repository resetPassword error', { error, email });
      throw error instanceof AuthError ? error : new AuthError(
        AuthErrorCode.UNKNOWN_ERROR,
        'Failed to send password reset email'
      );
    }
  }

  async updatePassword(
    userId: string, 
    currentPassword: string, 
    newPassword: string
  ): Promise<void> {
    try {
      // Verify current password first
      const { data: { user } } = await supabase.auth.getUser();
      if (!user || user.id !== userId) {
        throw new AuthError(
          AuthErrorCode.INVALID_TOKEN,
          'Invalid user session'
        );
      }

      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) {
        throw this.mapSupabaseError(error);
      }
    } catch (error) {
      logger.error('Repository updatePassword error', { error, userId });
      throw error instanceof AuthError ? error : new AuthError(
        AuthErrorCode.UNKNOWN_ERROR,
        'Failed to update password'
      );
    }
  }

  async validateSession(session: AuthSession): Promise<boolean> {
    try {
      const { data: { user }, error } = await supabase.auth.getUser(
        session.tokens.accessToken
      );

      return !error && !!user && user.id === session.user.id;
    } catch (error) {
      logger.error('Repository validateSession error', { error });
      return false;
    }
  }

  // Private helper methods

  private mapSupabaseError(error: any): AuthError {
    const message = error.message || 'Authentication error';
    
    if (message.includes('Invalid login credentials')) {
      return new AuthError(AuthErrorCode.INVALID_CREDENTIALS, 'Invalid email or password');
    }
    
    if (message.includes('User already registered')) {
      return new AuthError(AuthErrorCode.USER_EXISTS, 'An account with this email already exists');
    }
    
    if (message.includes('Password should be at least')) {
      return new AuthError(AuthErrorCode.WEAK_PASSWORD, 'Password must be at least 6 characters');
    }
    
    if (message.includes('Invalid email')) {
      return new AuthError(AuthErrorCode.INVALID_EMAIL, 'Please enter a valid email address');
    }
    
    if (message.includes('Network request failed') || message.includes('fetch')) {
      return new AuthError(AuthErrorCode.NETWORK_ERROR, 'Network connection error. Please check your internet connection.');
    }
    
    return new AuthError(AuthErrorCode.UNKNOWN_ERROR, message);
  }

  private async mapToUser(supabaseUser: any): Promise<User> {
    const profile = await this.getUserById(supabaseUser.id);
    
    return profile || {
      id: supabaseUser.id,
      email: supabaseUser.email!,
      role: supabaseUser.user_metadata?.role || 'customer',
      fullName: supabaseUser.user_metadata?.full_name || '',
      phoneNumber: supabaseUser.user_metadata?.phone_number || '',
      emailVerified: !!supabaseUser.email_confirmed_at,
      createdAt: supabaseUser.created_at,
      updatedAt: supabaseUser.updated_at || supabaseUser.created_at,
    };
  }

  private async mapToAuthSession(
    session: any, 
    supabaseUser: any,
    user?: User
  ): Promise<AuthSession> {
    const mappedUser = user || await this.mapToUser(supabaseUser);
    
    return {
      sessionId: session.access_token,
      user: mappedUser,
      tokens: {
        accessToken: session.access_token,
        refreshToken: session.refresh_token,
        expiresIn: session.expires_in || 3600,
      },
    };
  }
}
