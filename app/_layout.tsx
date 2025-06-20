import { Stack } from 'expo-router';
import { AuthProvider } from '@/services/auth/AuthProvider';
import { ErrorBoundary } from '@/app/_components/common/ErrorBoundary';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AppProvider } from '@/providers/AppProvider'
import { useFrameworkReady } from '@/hooks/useFrameworkReady';
import { Platform, LogBox } from 'react-native';

// Only ignore warnings, don't override fetch
if (Platform.OS !== 'web') {
  LogBox.ignoreLogs([
    'Non-serializable values were found in the navigation state',
    'VirtualizedLists should never be nested'
  ]);
}

export default function RootLayout() {
  useFrameworkReady();
  return (
    <ErrorBoundary>
      <SafeAreaProvider>
        <AppProvider>
          <AuthProvider>
            <Stack screenOptions={{ headerShown: false }}>
              <Stack.Screen name="index" />
              <Stack.Screen name="(auth)" />
              <Stack.Screen name="(customer)" />
              <Stack.Screen name="(restaurant)" />
              <Stack.Screen name="(driver)" />
              <Stack.Screen name="(shared)" />
            </Stack>
          </AuthProvider>
        </AppProvider>
      </SafeAreaProvider>
    </ErrorBoundary>
  );
}
