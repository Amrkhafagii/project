import React, { createContext, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { authService } from './authService';
import { User, UserRole } from '@/types/auth';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  didCheckAuth: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, role: UserRole) => Promise<void>;
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<User>) => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [didCheckAuth, setDidCheckAuth] = useState(false);

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      console.log('AuthProvider: Getting initial session');
      try {
        const { data: { session } } = await supabase.auth.getSession();
        console.log('AuthProvider: Session retrieved, exists?', !!session?.user);
        if (session?.user) {
          try {
            console.log('AuthProvider: Fetching user profile for user ID:', session.user.id);
            const userProfile = await authService.getUserProfile(session.user.id);
            console.log('AuthProvider: User profile retrieved:', userProfile?.id, userProfile?.role);
            setUser(userProfile);
          } catch (profileError) {
            console.error('Failed to load user profile:', profileError);
            // If profile loading fails, we'll treat as not logged in
            setUser(null);
          }
        }
      } catch (error) {
        console.error('Error getting initial session:', error);
        setUser(null);
      } finally {
        setLoading(false);
        setDidCheckAuth(true);
      }
    };

    getInitialSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('AuthProvider: Auth state changed, event:', event);
        console.log('AuthProvider: Session exists?', !!session?.user);
        try {
          if (!session?.user) {
            console.log('AuthProvider: No active session, setting user to null');
            setUser(null);
            setLoading(false);
            return;
          }
          
          try {
            console.log('AuthProvider: Fetching user profile on auth change for user ID:', session.user.id);
            const userProfile = await authService.getUserProfile(session.user.id);
            console.log('AuthProvider: User profile retrieved on auth change:', userProfile?.id, userProfile?.role);
            setUser(userProfile);
          } catch (profileError) {
            console.error('Failed to load user profile during auth change:', profileError);
            // If profile loading fails, we'll treat as not logged in
            setUser(null);
          }
        } catch (error) {
          console.error('Error in auth state change:', error);
          setUser(null);
        } finally {
          setLoading(false);
          setDidCheckAuth(true);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    setLoading(true);
    try {
      await authService.signIn(email, password);
      // User will be set by the onAuthStateChange listener
    } catch (error) {
      setLoading(false);
      throw error;
    }
  };

  const signUp = async (email: string, password: string, role: UserRole) => {
    console.log('AuthProvider: Signing up user with role:', role);
    setLoading(true);
    try {
      await authService.signUp(email, password, role);
      console.log('AuthProvider: User signed up successfully');
      // User will be set by the onAuthStateChange listener
    } catch (error) {
      console.error('AuthProvider: Sign up error:', error);
      setLoading(false);
      throw error;
    }
  };

  const signOut = async () => {
    setLoading(true);
    try {
      await authService.signOut();
      setUser(null);
      console.log('AuthProvider: User signed out successfully');
    } catch (error) {
      console.error('AuthProvider: Sign out error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (updates: Partial<User>) => {
    if (!user) throw new Error('No user logged in');
    
    console.log('AuthProvider: Updating profile for user:', user.id);
    setLoading(true);
    try {
      const updatedUser = await authService.updateProfile(user.id, updates);
      console.log('AuthProvider: Profile updated successfully:', updatedUser?.id);
      setUser(updatedUser);
    } catch (error) {
      console.error('AuthProvider: Update profile error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      loading, 
      didCheckAuth,
      signIn, 
      signUp, 
      signOut, 
      updateProfile 
    }}>
      {children}
    </AuthContext.Provider>
  );
}
