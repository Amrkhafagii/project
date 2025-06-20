import { supabase } from '@/lib/supabase';
import { User, UserRole } from '@/types/auth';

class AuthService {
  async signIn(email: string, password: string): Promise<User> {
    try {
      console.log(`[AuthService] Attempting sign in for: ${email}`);
      
      // Add retry logic for network failures
      let retries = 3;
      let lastError: any;
      
      while (retries > 0) {
        try {
          const { data, error } = await supabase.auth.signInWithPassword({
            email: email.trim().toLowerCase(),
            password,
          });

          if (error) {
            console.error('[AuthService] Supabase auth error:', error);
            
            // Check if it's a network error
            if (error.message?.includes('Network request failed') || 
                error.message?.includes('fetch')) {
              lastError = error;
              retries--;
              if (retries > 0) {
                console.log(`[AuthService] Retrying... attempts left: ${retries}`);
                await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second before retry
                continue;
              }
            }
            
            // Provide more specific error messages
            if (error.message?.includes('Invalid login credentials')) {
              throw new Error('Invalid email or password');
            } else if (error.message?.includes('Email not confirmed')) {
              throw new Error('Please verify your email before signing in');
            } else if (error.message?.includes('Network request failed')) {
              throw new Error('Unable to connect to server. Please check your internet connection.');
            }
            
            throw new Error(error.message || 'Authentication failed');
          }

          if (!data.user) {
            throw new Error('No user data returned');
          }

          console.log(`[AuthService] Sign in successful for user: ${data.user.id}`);
          
          // Get user profile
          const userProfile = await this.getUserProfile(data.user.id);
          return userProfile;
          
        } catch (error) {
          if (retries === 0) {
            throw error;
          }
          lastError = error;
          retries--;
          if (retries > 0) {
            console.log(`[AuthService] Retrying... attempts left: ${retries}`);
            await new Promise(resolve => setTimeout(resolve, 1000));
          }
        }
      }
      
      throw lastError || new Error('Authentication failed after multiple attempts');
      
    } catch (error) {
      console.error('[AuthService] Sign in error:', error);
      
      // Re-throw with more context if needed
      if (error instanceof Error) {
        if (error.message.includes('fetch') || error.message.includes('Network request failed')) {
          throw new Error('Unable to connect to authentication server. Please check your internet connection.');
        }
        throw error;
      }
      
      throw new Error('An unexpected error occurred during sign in');
    }
  }

  async signUp(
    email: string, 
    password: string, 
    profileData: {
      fullName: string;
      phoneNumber: string;
      role: UserRole;
    }
  ): Promise<User> {
    try {
      console.log(`[AuthService] Attempting sign up for: ${email} with role: ${profileData.role}`);
      
      // Sign up with Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: email.trim().toLowerCase(),
        password,
        options: {
          data: {
            full_name: profileData.fullName,
            phone_number: profileData.phoneNumber,
            role: profileData.role,
          },
        },
      });

      if (authError) {
        console.error('[AuthService] Supabase signup error:', authError);
        
        if (authError.message.includes('already registered')) {
          throw new Error('An account with this email already exists');
        }
        
        throw new Error(authError.message || 'Sign up failed');
      }

      if (!authData.user) {
        throw new Error('No user data returned after sign up');
      }

      console.log(`[AuthService] User created in auth: ${authData.user.id}`);

      // Create user profile
      const { data: profile, error: profileError } = await supabase
        .from('users')
        .insert({
          id: authData.user.id,
          email: authData.user.email,
          full_name: profileData.fullName,
          phone_number: profileData.phoneNumber,
          role: profileData.role,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (profileError) {
        console.error('[AuthService] Profile creation error:', profileError);
        
        // If profile creation fails, we should clean up the auth user
        await supabase.auth.signOut();
        
        throw new Error('Failed to create user profile. Please try again.');
      }

      console.log(`[AuthService] Profile created for user: ${authData.user.id}`);

      return {
        id: profile.id,
        email: profile.email!,
        fullName: profile.full_name,
        phoneNumber: profile.phone_number || undefined,
        role: profile.role as UserRole,
        createdAt: profile.created_at,
        updatedAt: profile.updated_at,
      };
    } catch (error) {
      console.error('[AuthService] Sign up error:', error);
      
      if (error instanceof Error) {
        throw error;
      }
      
      throw new Error('An unexpected error occurred during sign up');
    }
  }

  async signOut(): Promise<void> {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('[AuthService] Sign out error:', error);
        throw new Error(error.message || 'Sign out failed');
      }
      console.log('[AuthService] User signed out successfully');
    } catch (error) {
      console.error('[AuthService] Sign out error:', error);
      throw error instanceof Error ? error : new Error('Sign out failed');
    }
  }

  async getUserProfile(userId: string): Promise<User> {
    try {
      console.log(`[AuthService] Fetching profile for user: ${userId}`);
      
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('[AuthService] Profile fetch error:', error);
        
        if (error.code === 'PGRST116') {
          throw new Error('User profile not found. Please complete your registration.');
        }
        
        throw new Error(error.message || 'Failed to fetch user profile');
      }

      if (!data) {
        throw new Error('No profile data found');
      }

      console.log(`[AuthService] Profile fetched successfully for user: ${userId}`);

      return {
        id: data.id,
        email: data.email,
        fullName: data.full_name,
        phoneNumber: data.phone_number || undefined,
        role: data.role as UserRole,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
      };
    } catch (error) {
      console.error('[AuthService] Get user profile error:', error);
      
      if (error instanceof Error) {
        throw error;
      }
      
      throw new Error('Failed to fetch user profile');
    }
  }

  async updateProfile(userId: string, updates: Partial<User>): Promise<User> {
    try {
      const { data, error } = await supabase
        .from('users')
        .update({
          full_name: updates.fullName,
          phone_number: updates.phoneNumber,
          updated_at: new Date().toISOString(),
        })
        .eq('id', userId)
        .select()
        .single();

      if (error) {
        console.error('[AuthService] Profile update error:', error);
        throw new Error(error.message || 'Failed to update profile');
      }

      return {
        id: data.id,
        email: data.email,
        fullName: data.full_name,
        phoneNumber: data.phone_number || undefined,
        role: data.role as UserRole,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
      };
    } catch (error) {
      console.error('[AuthService] Update profile error:', error);
      throw error instanceof Error ? error : new Error('Failed to update profile');
    }
  }

  async resetPassword(email: string): Promise<void> {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) {
        console.error('[AuthService] Password reset error:', error);
        throw new Error(error.message || 'Failed to send reset email');
      }
    } catch (error) {
      console.error('[AuthService] Reset password error:', error);
      throw error instanceof Error ? error : new Error('Failed to reset password');
    }
  }

  async getCurrentSession() {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error('[AuthService] Get session error:', error);
        return null;
      }
      
      return session;
    } catch (error) {
      console.error('[AuthService] Get current session error:', error);
      return null;
    }
  }

  // Test connection method
  async testConnection(): Promise<boolean> {
    try {
      const { error } = await supabase.auth.getSession();
      if (error) {
        console.error('[AuthService] Connection test failed:', error);
        return false;
      }
      console.log('[AuthService] Connection test successful');
      return true;
    } catch (error) {
      console.error('[AuthService] Connection test error:', error);
      return false;
    }
  }
}

export const authService = new AuthService();
