import React, { createContext, useEffect, useState, useCallback, useMemo } from 'react';
import { authService } from './AuthService';
import { User, AuthState, SignInData, SignUpData, AuthError } from '@/types/auth';
import { logger } from '@/utils/logger';

interface AuthContextType extends AuthState {
  signIn: (data: SignInData) => Promise<void>;
  signUp: (data: SignUpData) => Promise<void>;
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<User>) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  refreshSession: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: React.ReactNode;
}

/**
 * Authentication provider component
 * Manages authentication state and provides auth methods to the app
 */
export function AuthProvider({ children }: AuthProviderProps) {
  const [state, setState] = useState<AuthState>({
    user: null,
    session: null,
    loading: true,
    initialized: false,
    error: null,
  });

  // Initialize authentication state
  useEffect(() => {
    let mounted = true;

    const initializeAuth = async () => {
      try {
        logger.info('Initializing authentication');
        
        const session = await authService.getCurrentSession();
        
        if (mounted) {
          setState({
            user: session?.user || null,
            session,
            loading: false,
            initialized: true,
            error: null,
          });
        }
      } catch (error) {
        logger.error('Failed to initialize auth', { error });
        
        if (mounted) {
          setState({
            user: null,
            session: null,
            loading: false,
            initialized: true,
            error: error instanceof AuthError ? error : null,
          });
        }
      }
    };

    initializeAuth();

    // Subscribe to auth state changes
    const unsubscribe = authService.onAuthStateChange((event) => {
      if (!mounted) return;

      logger.info('Auth state changed', { type: event.type });

      switch (event.type) {
        case 'SIGNED_IN':
        case 'TOKEN_REFRESHED':
        case 'USER_UPDATED':
          setState(prev => ({
            ...prev,
            user: event.session?.user || null,
            session: event.session,
            error: null,
          }));
          break;

        case 'SIGNED_OUT':
        case 'SESSION_EXPIRED':
          setState(prev => ({
            ...prev,
            user: null,
            session: null,
            error: null,
          }));
          break;
      }
    });

    return () => {
      mounted = false;
      unsubscribe();
    };
  }, []);

  // Sign in method
  const signIn = useCallback(async (data: SignInData) => {
    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const session = await authService.signIn(data);
      
      setState(prev => ({
        ...prev,
        user: session.user,
        session,
        loading: false,
        error: null,
      }));
    } catch (error) {
      logger.error('Sign in failed in provider', { error });
      
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof AuthError ? error : null,
      }));
      
      throw error;
    }
  }, []);

  // Sign up method
  const signUp = useCallback(async (data: SignUpData) => {
    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const session = await authService.signUp(data);
      
      setState(prev => ({
        ...prev,
        user: session.user,
        session,
        loading: false,
        error: null,
      }));
    } catch (error) {
      logger.error('Sign up failed in provider', { error });
      
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof AuthError ? error : null,
      }));
      
      throw error;
    }
  }, []);

  // Sign out method
  const signOut = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      await authService.signOut();
      
      setState(prev => ({
        ...prev,
        user: null,
        session: null,
        loading: false,
        error: null,
      }));
    } catch (error) {
      logger.error('Sign out failed in provider', { error });
      
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof AuthError ? error : null,
      }));
      
      throw error;
    }
  }, []);

  // Update profile method
  const updateProfile = useCallback(async (updates: Partial<User>) => {
    if (!state.user) {
      throw new AuthError('INVALID_TOKEN', 'No user logged in');
    }

    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const updatedUser = await authService.updateProfile(updates);
      
      setState(prev => ({
        ...prev,
        user: updatedUser,
        loading: false,
        error: null,
      }));
    } catch (error) {
      logger.error('Update profile failed in provider', { error });
      
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof AuthError ? error : null,
      }));
      
      throw error;
    }
  }, [state.user]);

  // Reset password method
  const resetPassword = useCallback(async (email: string) => {
    try {
      await authService.resetPassword(email);
    } catch (error) {
      logger.error('Reset password failed in provider', { error });
      throw error;
    }
  }, []);

  // Refresh session method
  const refreshSession = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const session = await authService.refreshSession();
      
      setState(prev => ({
        ...prev,
        user: session?.user || null,
        session,
        loading: false,
        error: null,
      }));
    } catch (error) {
      logger.error('Refresh session failed in provider', { error });
      
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof AuthError ? error : null,
      }));
      
      throw error;
    }
  }, []);

  // Memoize context value to prevent unnecessary re-renders
  const contextValue = useMemo<AuthContextType>(() => ({
    ...state,
    signIn,
    signUp,
    signOut,
    updateProfile,
    resetPassword,
    refreshSession,
  }), [state, signIn, signUp, signOut, updateProfile, resetPassword, refreshSession]);

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}
