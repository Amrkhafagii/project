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
      firstName: profile.first_name,
      lastName: profile.last_name,
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
        first_name: '',
        last_name: '',
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
      firstName: profile.first_name,
      lastName: profile.last_name,
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
      throw new Error('User profile not found');
    }

    return {
      id: profile.id,
      email: profile.email,
      role: profile.role as UserRole,
      firstName: profile.first_name,
      lastName: profile.last_name,
      phone: profile.phone,
      createdAt: profile.created_at,
      updatedAt: profile.updated_at,
    };
  },

  async updateProfile(userId: string, updates: Partial<User>): Promise<User> {
    const updateData: any = {};
    
    if (updates.firstName !== undefined) updateData.first_name = updates.firstName;
    if (updates.lastName !== undefined) updateData.last_name = updates.lastName;
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
      firstName: profile.first_name,
      lastName: profile.last_name,
      phone: profile.phone,
      createdAt: profile.created_at,
      updatedAt: profile.updated_at,
    };
  },
};
