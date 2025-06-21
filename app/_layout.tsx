import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { AuthProvider } from '@/contexts/AuthContext';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { NetworkUtils } from '@/utils/network/networkUtils';
import { logger } from '@/utils/logger';
import { Alert } from 'react-native';

function RootLayoutNav() {
  useEffect(() => {
    // Monitor network connectivity
    const unsubscribe = NetworkUtils.subscribeToNetworkChanges((isConnected) => {
      if (!isConnected) {
        Alert.alert(
          'No Internet Connection',
          'Please check your internet connection and try again.',
          [{ text: 'OK' }]
        );
      }
    });

    // Initial network check
    NetworkUtils.isConnected().then((isConnected) => {
      logger.info('Initial network status', { isConnected });
    }).catch((error) => {
      logger.error('Failed to check initial network status', { error });
    });

    return () => {
      unsubscribe();
    };
  }, []);

  return (
    <Stack>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="(auth)" options={{ headerShown: false }} />
      <Stack.Screen name="(customer)" options={{ headerShown: false }} />
      <Stack.Screen name="(driver)" options={{ headerShown: false }} />
      <Stack.Screen name="(restaurant)" options={{ headerShown: false }} />
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <RootLayoutNav />
      </AuthProvider>
    </ErrorBoundary>
  );
}
