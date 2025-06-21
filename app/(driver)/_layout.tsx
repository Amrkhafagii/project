import { Stack } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext'
import { router } from 'expo-router';
import { useEffect } from 'react';
import { LoadingSpinner } from '@/features/shared/components/LoadingSpinner';

export default function DriverLayout() {
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.replace('/(auth)/login');
      } else if (user.role !== 'driver') {
        // Redirect to appropriate role
        router.replace('/');
      }
    }
  }, [user, loading]);

  if (loading) {
    return (
      <LoadingSpinner color="#F59E0B" />
    );
  }

  if (!user || user.role !== 'driver') {
    return null;
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="onboarding" />
      <Stack.Screen name="(tabs)" />
    </Stack>
  );
}
