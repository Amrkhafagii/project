import { Stack } from 'expo-router';

export default function DriverLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="login" />
      <Stack.Screen name="onboarding" />
      <Stack.Screen name="(tabs)" />
    </Stack>
  );
}
