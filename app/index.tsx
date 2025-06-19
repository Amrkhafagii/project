import { useEffect } from 'react';
import { router } from 'expo-router';
import { useAuth } from '@/services/auth/useAuth';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { UserRole } from '@/types/auth';

export default function Index() {
  const { user, loading, userRole } = useAuth();

  useEffect(() => {
    if (!loading) {
      if (user && userRole) {
        // Route based on user role
        switch (userRole) {
          case UserRole.CUSTOMER:
            router.replace('/(customer)/(tabs)');
            break;
          case UserRole.RESTAURANT:
            router.replace('/(restaurant)/(tabs)');
            break;
          case UserRole.DRIVER:
            router.replace('/(driver)/(tabs)');
            break;
          default:
            router.replace('/(customer)/login');
        }
      } else {
        // User is not authenticated, redirect to customer login
        router.replace('/(customer)/login');
      }
    }
  }, [user, loading, userRole]);

  return <LoadingSpinner />;
}
