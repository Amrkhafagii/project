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

    try {
      // Get user profile
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', authData.user.id)
        .maybeSingle();

      if (profileError) {
        console.error('Profile fetch error:', profileError);
        throw new Error(`Profile fetch failed: ${profileError.message}`);
      }

      // If no profile exists, create one
      if (!profile) {
        console.log('No profile found after login, creating default profile');
        return await this.createDefaultProfile(authData.user);
      }

      return mapProfileToUser(authData.user, profile);
    } catch (error) {
      console.error('Error retrieving user profile:', error);
      throw error;
    }
  },

  async signUp(
    email: string, 
    password: string, 
    role: UserRole, 
    fullName: string = ''
  ): Promise<User> {
    try {
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
      try {
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .insert({
            user_id: authData.user.id,
            full_name: fullName,
            role,
          })
          .select()
          .maybeSingle();

        if (profileError) {
          console.error('Failed to create profile:', profileError);
          throw new Error(`Failed to create user profile: ${profileError.message}`);
        }

        if (!profile) {
          throw new Error('Profile creation succeeded but returned no data');
        }

        return mapProfileToUser(authData.user, profile);
      } catch (error) {
        console.error('Profile creation error:', error);
        throw error;
      }
    } catch (error) {
      console.error('Sign up error:', error);
      throw error;
    }
  },

  async signOut(): Promise<void> {
    const { error } = await supabase.auth.signOut();
    if (error) {
      throw new Error(error.message);
    }
  },

  async createDefaultProfile(authUser: any): Promise<User> {
    try {
      // Create default profile
      const { data: newProfile, error: createError } = await supabase
        .from('profiles')
        .insert({
          user_id: authUser.id,
          full_name: '',
          role: 'customer',
        })
        .select()
        .single();

      if (createError) {
        console.error('Failed to create default profile:', createError);
        throw new Error(`Failed to create default user profile: ${createError.message}`);
      }

      return mapProfileToUser(authUser, newProfile);
    } catch (error) {
      console.error('Create default profile error:', error);
      throw error;
    }
  },

  async getUserProfile(userId: string): Promise<User> {
    try {
      // First get auth user to ensure we have the email
      const { data: authData, error: authError } = await supabase.auth.getUser();
      
      if (authError || !authData.user) {
        console.error('Unable to get auth user:', authError);
        throw new Error('Unable to get auth user data');
      }

      // Get profile with maybeSingle to handle the case of no profile
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      if (error) {
        console.error('Profile fetch error:', error);
        throw new Error(`Profile fetch failed: ${error.message}`);
      }

      // If profile doesn't exist, create a default one
      if (!profile) {
        console.log('No profile found, creating default profile for user', userId);
        return await this.createDefaultProfile(authData.user);
      }

      return mapProfileToUser(authData.user, profile);
    } catch (error) {
      console.error('Get user profile error:', error);
      throw error;
    }
  },

  async updateProfile(userId: string, updates: Partial<User>): Promise<User> {
    try {
      // Get latest auth user data to ensure email is up-to-date
      const { data: authData, error: authError } = await supabase.auth.getUser();
      if (authError || !authData.user) {
        throw new Error('Unable to get auth user data');
      }

      const updateData: any = {};
      
      if (updates.firstName !== undefined) updateData.full_name = updates.firstName;
      if (updates.phone !== undefined) updateData.phone = updates.phone;
      if (updates.role !== undefined) updateData.role = updates.role;
      if (updates.onboarded !== undefined) updateData.onboarded = updates.onboarded;

      // Include updated_at timestamp
      updateData.updated_at = new Date().toISOString();

      // First check if profile exists
      const { data: existingProfile, error: checkError } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      if (checkError) {
        console.error('Error checking existing profile:', checkError);
        throw new Error(`Profile check failed: ${checkError.message}`);
      }

      let profile;

      if (!existingProfile) {
        // Create profile if it doesn't exist
        const { data: newProfile, error: createError } = await supabase
          .from('profiles')
          .insert({
            user_id: userId,
            ...updateData
          })
          .select()
          .single();

        if (createError) {
          console.error('Failed to create profile during update:', createError);
          throw new Error(`Profile creation failed: ${createError.message}`);
        }

        profile = newProfile;
      } else {
        // Update existing profile
        const { data: updatedProfile, error: updateError } = await supabase
          .from('profiles')
          .update(updateData)
          .eq('user_id', userId)
          .select()
          .single();

        if (updateError) {
          console.error('Profile update error:', updateError);
          throw new Error(`Profile update failed: ${updateError.message}`);
        }

        profile = updatedProfile;
      }

      return mapProfileToUser(authData.user, profile);
    } catch (error) {
      console.error('Update profile error:', error);
      throw error;
    }
  },
};