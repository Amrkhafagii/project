import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { LoadingSpinner } from './LoadingSpinner';
import { UserRole } from '@/types/auth';

interface AuthGuardProps {
  children: React.ReactNode;
  requiredRole?: UserRole;
  fallback?: React.ReactNode;
}

export function AuthGuard({ 
  children, 
  requiredRole, 
  fallback = <LoadingSpinner /> 
}: AuthGuardProps) {
  const { user, loading } = useAuth();

  if (loading) {
    return <>{fallback}</>;
  }

  if (!user) {
    return null; // Will trigger redirect to auth
  }

  if (requiredRole && user.role !== requiredRole) {
    return null; // Will trigger redirect to appropriate role
  }

  return <>{children}</>;
}

export default AuthGuard;