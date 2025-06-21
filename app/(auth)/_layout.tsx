import { Stack } from 'expo-router';
import { Colors } from '@/constants';

export default function AuthLayout() {
  return (
    <Stack 
      screenOptions={{ 
        headerShown: false,
        animation: 'slide_from_right',
        contentStyle: {
          backgroundColor: Colors.background,
        },
      }}
    >
      <Stack.Screen name="welcome" options={{ gestureEnabled: false }} />
      <Stack.Screen name="login" />
      <Stack.Screen name="register" />
      <Stack.Screen name="role-selection" options={{ gestureEnabled: false }} />
      <Stack.Screen name="forgot-password" />
    </Stack>
  );
}
