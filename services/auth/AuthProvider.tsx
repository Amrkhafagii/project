import React, { createContext, useState, useEffect, useCallback } from 'react';
import { Alert } from 'react-native';
import { router } from 'expo-router';
import { supabase } from '@/services/supabase';
import { User, SignUpMetadata, UpdateProfileData } from '@/types/auth';
import { AUTH_ERRORS, ROLE_CONFIG } from '@/constants/auth';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, metadata: SignUpMetadata) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  updateProfile: (data: UpdateProfileData) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkUser();
    
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        await fetchUserProfile(session.user.id);
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const checkUser = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        await fetchUserProfile(session.user.id);
      }
    } catch (error) {
      console.error('Error checking user:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) throw error;

      setUser({
        id: userId,
        email: data.email,
        role: data.role,
        fullName: data.full_name,
        phoneNumber: data.phone_number,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
      });
    } catch (error) {
      console.error('Error fetching user profile:', error);
    }
  };

  const signIn = useCallback(async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        const errorMessage = error.message.includes('Invalid login credentials')
          ? AUTH_ERRORS.INVALID_CREDENTIALS
          : error.message;
        Alert.alert('Login Failed', errorMessage);
        throw error;
      }
    } catch (error) {
      throw error;
    }
  }, []);

  const signUp = useCallback(async (
    email: string, 
    password: string, 
    metadata: SignUpMetadata
  ) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: metadata,
        },
      });

      if (error) {
        return { error };
      }

      // Create profile
      if (data.user) {
        const { error: profileError } = await supabase
          .from('profiles')
          .insert({
            id: data.user.id,
            email: email,
            full_name: metadata.fullName,
            phone_number: metadata.phoneNumber,
            role: metadata.role,
          });

        if (profileError) {
          console.error('Error creating profile:', profileError);
          return { error: profileError };
        }
      }

      return { error: null };
    } catch (error) {
      return { error };
    }
  }, []);

  const signOut = useCallback(async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      setUser(null);
      router.replace('/(auth)/welcome');
    } catch (error) {
      Alert.alert('Error', 'Failed to sign out');
      console.error('Sign out error:', error);
    }
  }, []);

  const updateProfile = useCallback(async (data: UpdateProfileData) => {
    if (!user) throw new Error('No user logged in');

    try {
      const updates: any = {};
      if (data.fullName !== undefined) updates.full_name = data.fullName;
      if (data.phoneNumber !== undefined) updates.phone_number = data.phoneNumber;
      if (data.role !== undefined) updates.role = data.role;

      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.id);

      if (error) throw error;

      // Update local user state
      setUser(prev => prev ? {
        ...prev,
        ...data,
      } : null);

      // Navigate to appropriate dashboard if role was updated
      if (data.role && ROLE_CONFIG[data.role]) {
        router.replace(ROLE_CONFIG[data.role].defaultRoute as any);
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      throw error;
    }
  }, [user]);

  const resetPassword = useCallback(async (email: string) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: 'zenithapp://reset-password',
      });

      if (error) throw error;
    } catch (error) {
      console.error('Error sending reset email:', error);
      throw error;
    }
  }, []);

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      signIn,
      signUp,
      signOut,
      updateProfile,
      resetPassword,
    }}>
      {children}
    </AuthContext.Provider>
  );
}
