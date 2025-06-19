import { Stack } from 'expo-router';
import { useAuth } from '@/services/auth/AuthProvider';
import { router } from 'expo-router';
import { useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';

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
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
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
