import { useContext } from 'react';
import { AuthContext } from '@/services/auth/AuthProvider';

// Cache to prevent multiple hook calls from causing re-renders
let cachedContext: any = null;

// Cache to prevent multiple hook calls from causing re-renders
let cachedContext: any = null;

export function useAuth() {
  // Get the context from React
  let context = useContext(AuthContext);
  
  // If context is undefined, use the cached version if available
  if (context === undefined) {
    if (cachedContext !== null) {
      return cachedContext;
    } else {
      throw new Error('useAuth must be used within an AuthProvider');
    }
  } else {
    // Update the cache when we get a valid context
    cachedContext = context;
  }
  // If context is undefined, use the cached version if available
  if (context === undefined) {
    if (cachedContext !== null) {
      return cachedContext;
    } else {
      throw new Error('useAuth must be used within an AuthProvider');
    }
  } else {
    // Update the cache when we get a valid context
    cachedContext = context;
  }
  
  
  return context;
}
