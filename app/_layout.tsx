import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { AuthProvider } from '@/services/auth/authService';
import { useFrameworkReady } from '@/hooks/useFrameworkReady';
import 'react-native-url-polyfill/auto';

export default function RootLayout() {
  const isReady = useFrameworkReady();

  if (!isReady) {
    return null;
  }

  return (
    <AuthProvider>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(customer)" options={{ headerShown: false }} />
        <Stack.Screen name="(restaurant)" options={{ headerShown: false }} />
        <Stack.Screen name="(driver)" options={{ headerShown: false }} />
        <Stack.Screen name="+not-found" />
      </Stack>
      <StatusBar style="auto" />
    </AuthProvider>
  );
}
