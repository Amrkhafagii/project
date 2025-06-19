import { supabase } from '@/lib/supabase';
import { User, UserRole } from '@/types/auth';

export const authService = {
  async signIn(email: string, password: string): Promise<User> {
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) {
      throw new Error(authError.message);
    }

    if (!authData.user) {
      throw new Error('Authentication failed');
    }

    // Get user profile
    const { data: profile, error: profileError } = await supabase
      .from('users')
      .select('*')
      .eq('id', authData.user.id)
      .maybeSingle();

    if (profileError) {
      throw new Error(`Profile fetch failed: ${profileError.message}`);
    }

    if (!profile) {
      throw new Error('User profile not found');
    }

    return {
      id: profile.id,
      email: profile.email,
      role: profile.role as UserRole,
      firstName: profile.full_name,
      lastName: undefined,
      phone: profile.phone,
      createdAt: profile.created_at,
      updatedAt: profile.updated_at,
    };
  },

  async signUp(email: string, password: string, role: UserRole): Promise<User> {
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
      .from('users')
      .insert({
        id: authData.user.id,
        email: authData.user.email!,
        role,
        full_name: '',
        phone: null,
      })
      .select()
      .single();

    if (profileError) {
      throw new Error(`Profile creation failed: ${profileError.message}`);
    }

    return {
      id: profile.id,
      email: profile.email,
      role: profile.role as UserRole,
      firstName: profile.full_name,
      lastName: undefined,
      phone: profile.phone,
      createdAt: profile.created_at,
      updatedAt: profile.updated_at,
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
      .from('users')
      .select('*')
      .eq('id', userId)
      .maybeSingle();

    if (error) {
      throw new Error(`Profile fetch failed: ${error.message}`);
    }

    if (!profile) {
      // If profile doesn't exist, get user email from auth and create default profile
      const { data: authUser, error: authError } = await supabase.auth.getUser();
      
      if (authError || !authUser.user) {
        throw new Error('User profile not found and unable to get auth user');
      }

      // Create default profile
      const { data: newProfile, error: createError } = await supabase
        .from('users')
        .insert({
          id: userId,
          email: authUser.user.email!,
          role: 'customer',
          full_name: '',
          phone: null,
        })
        .select()
        .single();

      if (createError) {
        throw new Error(`Failed to create user profile: ${createError.message}`);
      }

      return {
        id: newProfile.id,
        email: newProfile.email,
        role: newProfile.role as UserRole,
        firstName: newProfile.full_name,
        lastName: undefined,
        phone: newProfile.phone,
        createdAt: newProfile.created_at,
        updatedAt: newProfile.updated_at,
      };
    }

    return {
      id: profile.id,
      email: profile.email,
      role: profile.role as UserRole,
      firstName: profile.full_name,
      lastName: undefined,
      phone: profile.phone,
      createdAt: profile.created_at,
      updatedAt: profile.updated_at,
    };
  },

  async updateProfile(userId: string, updates: Partial<User>): Promise<User> {
    const updateData: any = {};
    
    if (updates.firstName !== undefined) updateData.full_name = updates.firstName;
    if (updates.phone !== undefined) updateData.phone = updates.phone;
    if (updates.email !== undefined) updateData.email = updates.email;

    const { data: profile, error } = await supabase
      .from('users')
      .update(updateData)
      .eq('id', userId)
      .select()
      .single();

    if (error) {
      throw new Error(`Profile update failed: ${error.message}`);
    }

    return {
      id: profile.id,
      email: profile.email,
      role: profile.role as UserRole,
      firstName: profile.full_name,
      lastName: undefined,
      phone: profile.phone,
      createdAt: profile.created_at,
      updatedAt: profile.updated_at,
    };
  },
};