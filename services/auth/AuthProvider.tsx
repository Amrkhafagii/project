import React, { createContext, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { authService } from './authService';
import { Platform, Alert } from 'react-native';
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
    let mounted = true;

    // Get initial session
    const getInitialSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        console.log(`[AuthProvider] Initial session check: ${session ? 'Found' : 'Not found'}`);
        
        if (session?.user && mounted) {
          try {
            const userProfile = await authService.getUserProfile(session.user.id);
            if (mounted) {
              setUser(userProfile);
            }
          } catch (profileError) {
            console.error('[AuthProvider] Error fetching user profile:', profileError);
            if (mounted) {
              setUser(null);
            }
          }
        }
      } catch (error) {
        console.error('Error getting initial session:', error);
        if (mounted) {
          setUser(null);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    getInitialSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return;
        
        try {
          console.log(`[AuthProvider] Auth state changed: ${event}`);
          if (session?.user) {
            const userProfile = await authService.getUserProfile(session.user.id);
            if (mounted) {
              setUser(userProfile);
            }
          } else {
            if (mounted) {
              setUser(null);
            }
          }
        } catch (error) {
          console.error('Error in auth state change:', error);
          if (mounted) {
            setUser(null);
          }
        } finally {
          if (mounted) {
            setLoading(false);
          }
        }
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string): Promise<{ error?: Error }> => {
    console.log(`[AuthProvider] SignIn attempt for: ${email}`);
    
    try {
      setLoading(true);
      const user = await authService.signIn(email, password);
      setUser(user);
      console.log(`[AuthProvider] SignIn successful for: ${email}`);
      return {};
    } catch (error) {
      console.error(`[AuthProvider] SignIn failed for ${email}:`, error);
      
      if (Platform.OS !== 'web') {
        Alert.alert(
          'Login Failed',
          error instanceof Error 
            ? error.message 
            : 'Connection failed. Please check your network and try again.'
        );
      }
      
      return { error: error instanceof Error ? error : new Error(String(error)) };
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email: string, password: string, profileData?: any): Promise<{ error?: Error }> => {
    try {
      setLoading(true);
      const user = await authService.signUp(email, password, profileData || {});
      setUser(user);
      return {};
    } catch (error) {
      return { error: error instanceof Error ? error : new Error(String(error)) };
    } finally {
      setLoading(false);
    }
  };

  const signOut = async (): Promise<{ error?: Error }> => {
    try {
      setLoading(true);
      await authService.signOut();
      setUser(null);
      console.log('[AuthProvider] SignOut successful');
      return {};
    } catch (error) {
      console.error('[AuthProvider] SignOut failed:', error);
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
