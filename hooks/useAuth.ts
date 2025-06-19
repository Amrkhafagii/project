import { useContext } from 'react';
import { AuthContext } from '@/services/auth/AuthProvider';

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    console.error('useAuth hook used outside of AuthProvider');
    throw new Error('useAuth must be used within an AuthProvider component');
  }
  return context;
}
