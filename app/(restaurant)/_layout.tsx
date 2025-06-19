import { Stack } from 'expo-router';
import { useAuth } from '@/services/auth/AuthProvider';
import { View, ActivityIndicator, Text } from 'react-native';

export default function RestaurantLayout() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#10B981" />
        <Text style={{ marginTop: 10, color: '#666' }}>Loading restaurant dashboard...</Text>
      </View>
    );
  }

  if (!user || user.role !== 'restaurant') {
    return null;
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="onboarding" />
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="loading" />
    </Stack>
  );
}
