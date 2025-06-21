import React, { createContext, useState, useEffect, useCallback, useMemo, useContext } from 'react';
import { Alert } from 'react-native';
import { router } from 'expo-router';
import { authService } from '@/services/auth/AuthService';
import { 
  User, 
  SignUpData,
  UpdateProfileData,
  AuthSession,
  AuthError,
  AuthErrorCode
} from '@/types/auth';
import { ROLE_CONFIG } from '@/constants/auth';
import { logger } from '@/utils/logger';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, metadata: SignUpData) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  updateProfile: (data: UpdateProfileData) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Initialize auth state
    initializeAuth();

    // Subscribe to auth state changes
    const unsubscribe = authService.onAuthStateChange((event) => {
      logger.debug('Auth state changed', { type: event.type });
      
      switch (event.type) {
        case 'SIGNED_IN':
        case 'TOKEN_REFRESHED':
        case 'USER_UPDATED':
          if (event.session) {
            setUser(event.session.user);
          }
          break;
        case 'SIGNED_OUT':
        case 'SESSION_EXPIRED':
          setUser(null);
          router.replace('/(auth)/welcome');
          break;
      }
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const initializeAuth = async () => {
    try {
      const session = await authService.getCurrentSession();
      if (session) {
        setUser(session.user);
      }
    } catch (error) {
      logger.error('Failed to initialize auth', { error });
    } finally {
      setLoading(false);
    }
  };

  const signIn = useCallback(async (email: string, password: string) => {
    try {
      const session = await authService.signIn({ email, password });
      setUser(session.user);
      
      // Navigate to appropriate dashboard
      const roleConfig = ROLE_CONFIG[session.user.role];
      if (roleConfig) {
        router.replace(roleConfig.defaultRoute as any);
      }
    } catch (error) {
      if (error instanceof AuthError) {
        Alert.alert('Login Failed', error.message);
      } else {
        Alert.alert('Login Failed', 'An unexpected error occurred');
      }
      throw error;
    }
  }, []);

  const signUp = useCallback(async (
    email: string, 
    password: string, 
    metadata: SignUpData
  ) => {
    try {
      const session = await authService.signUp({
        email,
        password,
        ...metadata,
      });

      if (session.tokens.accessToken) {
        setUser(session.user);
        
        // Navigate to appropriate dashboard
        const roleConfig = ROLE_CONFIG[session.user.role];
        if (roleConfig) {
          router.replace(roleConfig.defaultRoute as any);
        }
      } else {
        // Email confirmation required
        Alert.alert(
          'Confirm Your Email',
          'Please check your email to confirm your account before signing in.'
        );
      }

      return { error: null };
    } catch (error) {
      if (error instanceof AuthError) {
        if (error.code === AuthErrorCode.USER_EXISTS) {
          Alert.alert('Sign Up Failed', 'An account with this email already exists');
        } else {
          Alert.alert('Sign Up Failed', error.message);
        }
      } else {
        Alert.alert('Sign Up Failed', 'An unexpected error occurred');
      }
      return { error };
    }
  }, []);

  const signOut = useCallback(async () => {
    try {
      await authService.signOut();
      setUser(null);
      router.replace('/(auth)/welcome');
    } catch (error) {
      Alert.alert('Error', 'Failed to sign out');
      logger.error('Sign out error:', error);
    }
  }, []);

  const updateProfile = useCallback(async (data: UpdateProfileData) => {
    try {
      const updatedUser = await authService.updateProfile(data);
      setUser(updatedUser);

      // Navigate to appropriate dashboard if role was updated
      if (data.role && ROLE_CONFIG[data.role]) {
        router.replace(ROLE_CONFIG[data.role].defaultRoute as any);
      }
    } catch (error) {
      logger.error('Error updating profile:', error);
      Alert.alert('Error', 'Failed to update profile');
      throw error;
    }
  }, []);

  const resetPassword = useCallback(async (email: string) => {
    try {
      await authService.resetPassword(email);
      Alert.alert(
        'Password Reset Email Sent',
        'Please check your email for instructions to reset your password.'
      );
    } catch (error) {
      logger.error('Error sending reset email:', error);
      Alert.alert('Error', 'Failed to send password reset email');
      throw error;
    }
  }, []);

  const contextValue = useMemo(() => ({
    user,
    loading,
    signIn,
    signUp,
    signOut,
    updateProfile,
    resetPassword,
  }), [user, loading, signIn, signUp, signOut, updateProfile, resetPassword]);

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
}
