import { supabase } from '@/services/supabase';
import { IAuthRepository } from '../interfaces/IAuthRepository';
import { 
  User, 
  SignInData, 
  SignUpData, 
  AuthSession, 
  AuthTokens,
  AuthError,
  AuthErrorCode 
} from '@/types/auth';

export class SupabaseAuthRepository implements IAuthRepository {
  async signIn(data: SignInData): Promise<AuthSession> {
    try {
      const { data: authData, error } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      });

      if (error) {
        throw new AuthError(
          AuthErrorCode.INVALID_CREDENTIALS,
          error.message
        );
      }

      if (!authData.session || !authData.user) {
        throw new AuthError(
          AuthErrorCode.INVALID_CREDENTIALS,
          'Invalid credentials'
        );
      }

      // Fetch user profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', authData.user.id)
        .single();

      const user: User = {
        id: authData.user.id,
        email: authData.user.email!,
        role: profile?.role || 'customer',
        fullName: profile?.full_name,
        phoneNumber: profile?.phone_number,
        createdAt: authData.user.created_at,
        updatedAt: profile?.updated_at,
      };

      return {
        user,
        tokens: {
          accessToken: authData.session.access_token,
          refreshToken: authData.session.refresh_token!,
          expiresIn: authData.session.expires_in!,
          tokenType: authData.session.token_type!,
        },
        sessionId: authData.session.access_token,
        expiresAt: new Date(authData.session.expires_at!).toISOString(),
      };
    } catch (error) {
      if (error instanceof AuthError) {
        throw error;
      }
      throw new AuthError(
        AuthErrorCode.UNKNOWN_ERROR,
        'Sign in failed'
      );
    }
  }

  async signUp(data: SignUpData): Promise<AuthSession> {
    try {
      const { data: authData, error } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            fullName: data.fullName,
            phoneNumber: data.phoneNumber,
            role: data.role,
          },
        },
      });

      if (error) {
        throw new AuthError(
          AuthErrorCode.VALIDATION_ERROR,
          error.message
        );
      }

      if (!authData.user) {
        throw new AuthError(
          AuthErrorCode.UNKNOWN_ERROR,
          'Sign up failed'
        );
      }

      // Create profile
      await supabase.from('profiles').insert({
        id: authData.user.id,
        email: data.email,
        full_name: data.fullName,
        phone_number: data.phoneNumber,
        role: data.role,
      });

      const user: User = {
        id: authData.user.id,
        email: authData.user.email!,
        role: data.role,
        fullName: data.fullName,
        phoneNumber: data.phoneNumber,
        createdAt: authData.user.created_at,
      };

      // If session exists (auto-confirmed), return it
      if (authData.session) {
        return {
          user,
          tokens: {
            accessToken: authData.session.access_token,
            refreshToken: authData.session.refresh_token!,
            expiresIn: authData.session.expires_in!,
            tokenType: authData.session.token_type!,
          },
          sessionId: authData.session.access_token,
          expiresAt: new Date(authData.session.expires_at!).toISOString(),
        };
      }

      // Return partial session for unconfirmed users
      return {
        user,
        tokens: {
          accessToken: '',
          refreshToken: '',
          expiresIn: 0,
          tokenType: 'bearer',
        },
        sessionId: '',
        expiresAt: new Date().toISOString(),
      };
    } catch (error) {
      if (error instanceof AuthError) {
        throw error;
      }
      throw new AuthError(
        AuthErrorCode.UNKNOWN_ERROR,
        'Sign up failed'
      );
    }
  }

  async signOut(sessionId: string): Promise<void> {
    const { error } = await supabase.auth.signOut();
    if (error) {
      throw new AuthError(
        AuthErrorCode.UNKNOWN_ERROR,
        error.message
      );
    }
  }

  async getCurrentSession(): Promise<AuthSession | null> {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        return null;
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();

      const user: User = {
        id: session.user.id,
        email: session.user.email!,
        role: profile?.role || 'customer',
        fullName: profile?.full_name,
        phoneNumber: profile?.phone_number,
        createdAt: session.user.created_at,
        updatedAt: profile?.updated_at,
      };

      return {
        user,
        tokens: {
          accessToken: session.access_token,
          refreshToken: session.refresh_token!,
          expiresIn: session.expires_in!,
          tokenType: session.token_type!,
        },
        sessionId: session.access_token,
        expiresAt: new Date(session.expires_at!).toISOString(),
      };
    } catch (error) {
      return null;
    }
  }

  async refreshSession(refreshToken: string): Promise<AuthTokens> {
    const { data, error } = await supabase.auth.refreshSession({
      refresh_token: refreshToken,
    });

    if (error || !data.session) {
      throw new AuthError(
        AuthErrorCode.REFRESH_TOKEN_EXPIRED,
        'Failed to refresh session'
      );
    }

    return {
      accessToken: data.session.access_token,
      refreshToken: data.session.refresh_token!,
      expiresIn: data.session.expires_in!,
      tokenType: data.session.token_type!,
    };
  }

  async updateUserProfile(userId: string, updates: Partial<User>): Promise<User> {
    const profileUpdates: any = {};
    if (updates.fullName !== undefined) profileUpdates.full_name = updates.fullName;
    if (updates.phoneNumber !== undefined) profileUpdates.phone_number = updates.phoneNumber;
    if (updates.role !== undefined) profileUpdates.role = updates.role;

    const { data, error } = await supabase
      .from('profiles')
      .update(profileUpdates)
      .eq('id', userId)
      .select()
      .single();

    if (error) {
      throw new AuthError(
        AuthErrorCode.UNKNOWN_ERROR,
        'Failed to update profile'
      );
    }

    return {
      id: userId,
      email: data.email,
      role: data.role,
      fullName: data.full_name,
      phoneNumber: data.phone_number,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };
  }

  async resetPassword(email: string): Promise<void> {
    const { error } = await supabase.auth.resetPasswordForEmail(email);
    
    if (error) {
      throw new AuthError(
        AuthErrorCode.UNKNOWN_ERROR,
        error.message
      );
    }
  }

  async updatePassword(
    userId: string, 
    currentPassword: string, 
    newPassword: string
  ): Promise<void> {
    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (error) {
      throw new AuthError(
        AuthErrorCode.UNKNOWN_ERROR,
        error.message
      );
    }
  }
}
