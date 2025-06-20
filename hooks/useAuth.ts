import { useContext } from 'react';
import { AuthContext } from '@/services/auth/AuthProvider';

/**
 * Hook to access authentication context
 * Provides type-safe access to auth state and methods
 */
export function useAuth() {
  const context = useContext(AuthContext);
  
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
}
