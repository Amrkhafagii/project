import { supabase } from '@/lib/supabase';
import { User, UserRole, UserProfile } from '@/types/auth';
import { Platform } from 'react-native';

export const authService = {
  async signIn(email: string, password: string): Promise<User> {
    console.log(`[Auth] Signing in user: ${email} on platform: ${Platform.OS}`);
    
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) {
      throw new Error(authError.message);
    }
    
    if (!authData?.user) {
      console.error('[Auth] Authentication succeeded but no user data returned');
      throw new Error('Authentication failed: No user data returned');
    }

    // Create basic user with minimal info in case profile fetch fails
    const basicUser: User = {
      id: authData.user.id,
      email: authData.user.email!,
      role: null,
      firstName: '',
      lastName: '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Try to get profile but don't fail auth if profile fetch fails
    try {
      console.log(`[Auth] Auth successful, fetching profile for user: ${authData.user.id}`);
      
      // Get user profile
      const { data: profile, error: profileError } = await supabase 
        .from('profiles')
        .select('*')
        .eq('user_id', authData.user.id)
        .single();

      if (profileError) {
        console.warn(`[Auth] Profile fetch warning: ${profileError.message}`);
        return basicUser;
      }

      if (!profile) {
        console.warn('[Auth] Profile not found, returning basic user');
        return basicUser;
      }

      console.log('[Auth] Login complete, returning user data');
      return {
        id: authData.user.id,
        email: authData.user.email!,
        role: profile.role as UserRole,
        firstName: profile.full_name?.split(' ')[0] || '',
        lastName: profile.full_name?.split(' ')[1] || '',
        phone: profile.phone,
        onboarded: profile.onboarded || false,
        createdAt: profile.created_at || new Date().toISOString(),
        updatedAt: profile.updated_at || new Date().toISOString(),
        preferences: profile.preferences || {},
        fitnessProfile: profile.fitness_profile || undefined,
      };
    } catch (profileError) {
      console.error('[Auth] Profile fetch error:', profileError);
      // Return basic user even if profile fetch fails
      return basicUser;
    }
  },

  async signUp(email: string, password: string, profileData: { fullName?: string }): Promise<User> {
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
    });

    if (authError) {
      throw new Error(authError.message);
    }

    if (!authData.user) {
      throw new Error('Registration failed');
    }

    // Create user profile
    const { data: profile, error: profileError } = await supabase 
      .from('profiles')
      .insert({
        user_id: authData.user.id,
        full_name: profileData.fullName || '',
        role: null, // Role will be set later
        phone: null,
        onboarded: false,
      })
      .select()
      .single();

    if (profileError) {
      throw new Error(`Profile creation failed: ${profileError.message}`);
    }

    return {
      id: authData.user.id,
      email: authData.user.email!,
      role: null, // No role yet
      firstName: profileData.fullName?.split(' ')[0] || '',
      lastName: profileData.fullName?.split(' ')[1] || '',
      phone: profile.phone,
      onboarded: false,
      createdAt: profile.created_at || new Date().toISOString(),
      updatedAt: profile.updated_at || new Date().toISOString(),
    };
  },

  async signOut(): Promise<void> {
    const { error } = await supabase.auth.signOut();
    if (error) {
      throw new Error(error.message);
    }
  },

  async getUserProfile(userId: string): Promise<User> {
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error) {
      console.error(`[Auth] Profile fetch failed for user ${userId}:`, error.message);
      throw new Error(`Profile fetch failed: ${error.message}`);
    }

    if (!profile) {
      console.error(`[Auth] No profile found for user ${userId}`);
      throw new Error('User profile not found');
    }

    return {
      id: userId,
      email: '', // We would need to get this from auth.users table
      role: profile.role as UserRole | null,
      firstName: profile.full_name?.split(' ')[0] || '',
      lastName: profile.full_name?.split(' ')[1] || '',
      phone: profile.phone,
      onboarded: profile.onboarded || false,
      createdAt: profile.created_at || new Date().toISOString(),
      updatedAt: profile.updated_at || new Date().toISOString(),
      preferences: profile.preferences || {},
      fitnessProfile: profile.fitness_profile || undefined,
    };
  },

  async updateProfile(userId: string, updates: Partial<User>): Promise<User> {
    // Prepare update data
    const updateData: Partial<UserProfile> = {
      updated_at: new Date().toISOString(),
    };
    
    // Handle name updates
    if (updates.firstName !== undefined || updates.lastName !== undefined) {
      // Use separate query to avoid recursion
      const { data: currentProfile, error: profileError } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('user_id', userId)
        .single();
      
      if (profileError) {
        throw new Error(`Profile fetch failed: ${profileError.message}`);
      }
      
      const nameParts = currentProfile?.full_name?.split(' ') || ['', ''];
      const firstName = updates.firstName !== undefined ? updates.firstName : nameParts[0];
      const lastName = updates.lastName !== undefined ? updates.lastName : nameParts.slice(1).join(' ');
      updateData.full_name = `${firstName} ${lastName}`.trim();
    }
    
    // Handle other fields
    if (updates.role !== undefined) updateData.role = updates.role;
    if (updates.phone !== undefined) updateData.phone = updates.phone;
    if (updates.onboarded !== undefined) updateData.onboarded = updates.onboarded;
    if (updates.preferences !== undefined) updateData.preferences = updates.preferences;
    if (updates.fitnessProfile !== undefined) updateData.fitness_profile = updates.fitnessProfile;
    
    const { data: profile, error } = await supabase
      .from('profiles')
      .update(updateData)
      .eq('user_id', userId)
      .select()
      .single();
    
    if (error) {
      throw new Error(`Profile update failed: ${error.message}`);
    }
    
    return {
      id: userId,
      email: '', // We would need to get this from auth.users
      role: profile.role as UserRole | null,
      firstName: profile.full_name?.split(' ')[0] || '',
      lastName: profile.full_name?.split(' ')[1] || '',
      phone: profile.phone,
      onboarded: profile.onboarded || false,
      createdAt: profile.created_at || new Date().toISOString(),
      updatedAt: profile.updated_at,
      preferences: profile.preferences || {},
      fitnessProfile: profile.fitness_profile || undefined,
    };
  },

  async resetPassword(email: string): Promise<void> {
    // Use a dynamic redirect URL based on the platform
    const redirectUrl = Platform.OS === 'web' 
      ? 'https://zenith-meal-delivery.com/reset-password'
      : 'zenith-meal-delivery://reset-password';
    
    const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: redirectUrl });
    
    if (error) {
      console.error(`[Auth] Password reset failed for ${email}:`, error.message);
      throw new Error(`Password reset failed: ${error.message}`);
    }
  },
};
