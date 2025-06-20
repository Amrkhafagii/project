import React, { createContext, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { authService } from './authService';
import { User, UserRole } from '@/types/auth';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error?: Error }>;
  signUp: (email: string, password: string, profileData?: any) => Promise<{ error?: Error }>;
  signOut: () => Promise<{ error?: Error }>;
  updateProfile: (updates: Partial<User>) => Promise<void>;
  resetPassword: (email: string) => Promise<{ error?: Error }>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          const userProfile = await authService.getUserProfile(session.user.id);
          setUser(userProfile);
        }
      } catch (error) {
        console.error('Error getting initial session:', error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    getInitialSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        try {
          if (session?.user) {
            const userProfile = await authService.getUserProfile(session.user.id);
            setUser(userProfile);
          } else {
            setUser(null);
          }
        } catch (error) {
          console.error('Error in auth state change:', error);
          setUser(null);
        } finally {
          setLoading(false);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string): Promise<{ error?: Error }> => {
    setLoading(true);
    try {
      const user = await authService.signIn(email, password);
      setUser(user);
      return {};
    } catch (error) {
      setLoading(false);
      return { error: error instanceof Error ? error : new Error(String(error)) };
    }
  };

  const signUp = async (email: string, password: string, profileData?: any): Promise<{ error?: Error }> => {
    setLoading(true);
    try {
      const user = await authService.signUp(email, password, profileData || {});
      setUser(user);
      return {};
    } catch (error) {
      setLoading(false);
      return { error: error instanceof Error ? error : new Error(String(error)) };
    }
  };

  const signOut = async (): Promise<{ error?: Error }> => {
    setLoading(true);
    try {
      await authService.signOut();
      setUser(null);
      return {};
    } catch (error) {
      return { error: error instanceof Error ? error : new Error(String(error)) };
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (updates: Partial<User>) => {
    if (!user) throw new Error('No user logged in');
    
    setLoading(true);
    try {
      const updatedUser = await authService.updateProfile(user.id, updates);
      setUser(updatedUser);
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (email: string): Promise<{ error?: Error }> => {
    try {
      await authService.resetPassword(email);
      return {};
    } catch (error) {
      return { error: error instanceof Error ? error : new Error(String(error)) };
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      loading, 
      signIn, 
      signUp, 
      signOut,
      updateProfile,
      resetPassword
    }}>
      {children}
    </AuthContext.Provider>
  );
}
