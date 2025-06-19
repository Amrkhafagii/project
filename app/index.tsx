import React, { useEffect } from 'react';
import { View, ActivityIndicator, Text } from 'react-native';
import { router } from 'expo-router';
import { useAuth } from '@/hooks/useAuth';
import { useFrameworkReady } from '@/hooks/useFrameworkReady';
import { Colors } from '@/constants';

export default function IndexScreen() {
  const { user, loading, didCheckAuth } = useAuth();
  const isFrameworkReady = useFrameworkReady();

  console.log('Index: Framework ready?', isFrameworkReady);
  console.log('Index: Auth loading?', loading);
  console.log('Index: User exists?', !!user);
  console.log('Index: Auth check completed?', didCheckAuth);
  console.log('Index: User data:', user ? { 
    id: user.id, 
    email: user.email, 
    role: user.role 
  } : 'null');

  useEffect(() => {
    if (!isFrameworkReady || loading || !didCheckAuth) return;

    console.log('Index: Navigation logic executing...');

    if (!user) {
      console.log('Index: Redirecting to auth/login (no user)');
      // No user, redirect to auth
      router.replace('/(auth)/login');
      return;
    }

    // Check if user needs to complete role selection
    if (!user.role) {
      console.log('Index: Redirecting to role selection (no role)');
      router.replace('/(auth)/role-selection');
      return;
    }

    // Redirect based on user role
    console.log(`Index: Redirecting based on role: ${user.role}`);
    switch (user.role) {
      case 'customer':
        console.log('Index: Redirecting to customer tabs');
        router.replace('/(customer)/(tabs)');
        break;
      case 'restaurant':
        // Check if restaurant needs onboarding
        console.log('Index: Restaurant role - onboarded?', !!user.onboarded);
        if (!user.onboarded) {
          console.log('Index: Redirecting to restaurant onboarding');
          router.replace('/(restaurant)/onboarding');
        } else {
          console.log('Index: Redirecting to restaurant tabs');
          router.replace('/(restaurant)/(tabs)');
        }
        break;
      case 'driver':
        // Check if driver needs onboarding
        console.log('Index: Driver role - onboarded?', !!user.onboarded);
        if (!user.onboarded) {
          console.log('Index: Redirecting to driver onboarding');
          router.replace('/(driver)/onboarding');
        } else {
          console.log('Index: Redirecting to driver tabs');
          router.replace('/(driver)/(tabs)');
        }
        break;
      default:
        console.log('Index: Redirecting to auth/login (invalid role)');
        router.replace('/(auth)/login');
    }
  }, [user, loading, isFrameworkReady, didCheckAuth]);

  // Show loading screen while determining route
  return (
    <View style={{ 
      flex: 1, 
      justifyContent: 'center', 
      alignItems: 'center',
      backgroundColor: Colors.background 
    }}>
      <ActivityIndicator size="large" color={Colors.primary} style={{ marginBottom: 16 }} />
      <Text style={{ color: Colors.textSecondary }}>
        {loading ? 'Checking authentication...' : 'Loading app...'}
      </Text>
    </View>
  );
}
