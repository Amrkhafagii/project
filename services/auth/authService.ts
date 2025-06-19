import { supabase } from '@/lib/supabase';
import { User, UserRole } from '@/types/auth';

export const authService = {
  async signIn(email: string, password: string): Promise<User> {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;
    if (!data.user) throw new Error('No user returned');

    const userProfile = await this.getUserProfile(data.user.id);
    return userProfile;
  },

  async signUp(email: string, password: string, role: UserRole): Promise<User> {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) throw error;
    if (!data.user) throw new Error('No user returned');

    // Create user profile
    const userProfile = await this.createUserProfile(data.user.id, email, role);
    return userProfile;
  },

  async signOut(): Promise<void> {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },

  async getUserProfile(userId: string): Promise<User> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) throw error;
    if (!data) throw new Error('User profile not found');

    return data;
  },

  async createUserProfile(userId: string, email: string, role: UserRole): Promise<User> {
    const { data, error } = await supabase
      .from('users')
      .insert({
        id: userId,
        email,
        role,
        onboarded: role === 'customer', // Customers don't need onboarding
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw error;
    if (!data) throw new Error('Failed to create user profile');

    return data;
  },

  async updateProfile(userId: string, updates: Partial<User>): Promise<User> {
    const { data, error } = await supabase
      .from('users')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId)
      .select()
      .single();

    if (error) throw error;
    if (!data) throw new Error('Failed to update user profile');

    return data;
  },
};
