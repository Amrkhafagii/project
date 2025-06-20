import { Stack } from 'expo-router';
import { AuthProvider } from '@/services/auth/AuthProvider';
import { ErrorBoundary } from '@/app/_components/common/ErrorBoundary';
import { AppProvider } from '@/providers/AppProvider'
import { useFrameworkReady } from '@/hooks/useFrameworkReady';

export default function RootLayout() {
  useFrameworkReady();
  return (
    <ErrorBoundary>
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
    </ErrorBoundary>
  );

}