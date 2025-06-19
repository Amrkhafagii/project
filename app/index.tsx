import { useEffect } from 'react';
import { router } from 'expo-router';
import { useAuth } from '@/services/auth/authService';
import { LoadingSpinner } from '@/features/shared/components/LoadingSpinner';

export default function Index() {
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading) {
      if (user) {
        // User is authenticated, redirect to customer tabs
        router.replace('/(customer)/(tabs)');
      } else {
        // User is not authenticated, redirect to customer login
        router.replace('/(customer)/login');
      }
    }
  }, [user, loading]);

  return <LoadingSpinner />;
}
