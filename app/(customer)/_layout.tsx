import { Stack } from 'expo-router';
import { useAuth } from '@/services/auth/AuthProvider';
import { router } from 'expo-router';
import { useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { LoadingSpinner } from '@/features/shared/components/LoadingSpinner';

export default function CustomerLayout() {
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.replace('/(auth)/login');
      } else if (user.role !== 'customer') {
        // Redirect to appropriate role
        router.replace('/');
      }
    }
  }, [user, loading]);

  if (loading) {
    return (
      <LoadingSpinner color="#007AFF" />
    );
  }

  if (!user || user.role !== 'customer') {
    return null;
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" />
    </Stack>
  );
}
