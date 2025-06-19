import { Stack } from 'expo-router';
import { useAuth } from '@/services/auth/AuthProvider';
import { router } from 'expo-router';
import { useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';

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
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#F59E0B" />
      </View>
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
