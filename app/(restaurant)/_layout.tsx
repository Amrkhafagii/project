import { Stack } from 'expo-router';
import { useAuth } from '@/hooks/useAuth';
import { router } from 'expo-router';
import { useEffect } from 'react';
import { LoadingSpinner } from '@/features/shared/components/LoadingSpinner';

export default function RestaurantLayout() {
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.replace('/(auth)/login');
      } else if (user.role !== 'restaurant') {
        // Redirect to appropriate role
        router.replace('/');
      }
    }
  }, [user, loading]);

  if (loading) {
    return (
      <LoadingSpinner color="#10B981" />
    );
  }

  if (!user || user.role !== 'restaurant') {
    return null;
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="onboarding" />
      <Stack.Screen name="(tabs)" />
    </Stack>
  );
}
