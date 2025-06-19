import { supabase } from '@/lib/supabase';
import { User, UserRole } from '@/types/auth';

// Helper function to map database profile to User type
const mapProfileToUser = (authUser: any, profile: any): User => {
  return {
    id: authUser.id,
    email: authUser.email,
    role: profile?.role as UserRole || 'customer',
    firstName: profile?.full_name || '',
    lastName: undefined,
    phone: profile?.phone || null,
    onboarded: profile?.onboarded || false,
    createdAt: profile?.created_at || new Date().toISOString(),
    updatedAt: profile?.updated_at || new Date().toISOString(),
  };
};

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
      .from('profiles')
      .select('*')
      .eq('user_id', authData.user.id)
      .single();

    if (profileError) {
      throw new Error(`Profile fetch failed: ${profileError.message}`);
    }

    return mapProfileToUser(authData.user, profile);
  },

  async signUp(
    email: string, 
    password: string, 
    role: UserRole, 
    fullName: string = ''
  ): Promise<User> {
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
        full_name: fullName,
        role,
        phone: null
      })
      .select()
      .single();

    if (profileError) {
      throw new Error(`Profile creation failed: ${profileError.message}`);
    }

    return mapProfileToUser(authData.user, profile);
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
      .maybeSingle();

    if (error) {
      console.error('Profile fetch error:', error);
      throw new Error(`Profile fetch failed: ${error.message || 'unknown error'}`);
    }

    if (!profile) {
      // If profile doesn't exist, get user email from auth and create default profile
      console.log('No profile found, creating default profile for user', userId);
      const { data: authUser, error: authError } = await supabase.auth.getUser();
      
      if (authError || !authUser.user) {
        console.error('Unable to get auth user:', authError);
        throw new Error('User profile not found and unable to get auth user');
      }

      // Create default profile
      const { data: newProfile, error: createError } = await supabase
        .from('profiles')
        .insert({
          user_id: userId,
          full_name: '',
          role: 'customer',
          phone: null,
        })
        .select()
        .single();

      if (createError) {
        console.error('Failed to create profile:', createError);
        throw new Error(`Failed to create user profile: ${createError.message}`);
      }

      return mapProfileToUser(authUser.user, newProfile);
    }

    // Get the user's email from auth
    const { data: authUser, error: authError } = await supabase.auth.getUser();
    if (authError || !authUser.user) {
      throw new Error('Unable to get auth user data');
    }

    return mapProfileToUser(authUser.user, profile);
  },

  async updateProfile(userId: string, updates: Partial<User>): Promise<User> {
    const updateData: any = {};
    
    if (updates.firstName !== undefined) updateData.full_name = updates.firstName;
    if (updates.phone !== undefined) updateData.phone = updates.phone;
    if (updates.role !== undefined) updateData.role = updates.role;
    if (updates.onboarded !== undefined) updateData.onboarded = updates.onboarded;

    // Include updated_at timestamp
    updateData.updated_at = new Date().toISOString();

    const { data: profile, error } = await supabase
      .from('profiles')
      .update(updateData)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) {
      throw new Error(`Profile update failed: ${error.message}`);
    }

    // Get latest auth user data to ensure email is up-to-date
    const { data: authUser, error: authError } = await supabase.auth.getUser();
    if (authError || !authUser.user) {
      throw new Error('Unable to get auth user data');
    }

    return mapProfileToUser(authUser.user, profile);
  },
};