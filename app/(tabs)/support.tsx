import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { LoadingSpinner } from '@/features/shared/components/LoadingSpinner';
import { AdvancedCustomerSupport } from '@/features/shared/components/AdvancedCustomerSupport';

export default function SupportScreen() {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!user) {
    return null; // This will trigger a redirect to auth
  }

  return (
    <AdvancedCustomerSupport
      userId={user?.id || 'guest'}
    />
  );
}
