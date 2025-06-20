import React, { useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import { useAuth } from '@/hooks/useAuth';
import { Colors } from '@/constants';
import { useFrameworkReady } from '@/hooks/useFrameworkReady';

export default function IndexScreen() {
  const { user, loading } = useAuth();
  const isFrameworkReady = useFrameworkReady();

  useEffect(() => {
    if (!isFrameworkReady || loading) return;

    if (!user) {
      // No user, redirect to welcome screen
      router.replace('/(auth)/welcome');
      return;
    }

    // Check if user needs to complete role selection
    if (!user.role) {
      router.replace('/(auth)/role-selection');
      return;
    }

    // Redirect based on user role
    switch (user.role) {
      case 'customer':
        // Check if customer has completed onboarding
        if (!user.onboarded) {
          router.replace('/(customer)/onboarding');
          return;
        }
        router.replace('/(customer)/(tabs)');
        break;
      case 'restaurant':
        // Check if restaurant needs onboarding
        if (!user.onboarded) {
          router.replace('/(restaurant)/onboarding');
          return;
        }
        // Check if restaurant needs onboarding
        if (!user.onboarded) {
          router.replace('/(restaurant)/onboarding');
        } else {
          router.replace('/(restaurant)/(tabs)');
        }
        break;
      case 'driver':
        // Check if driver needs onboarding
        if (!user.onboarded) {
          router.replace('/(driver)/onboarding');
          return;
        }
        // Check if driver needs onboarding
        if (!user.onboarded) {
          router.replace('/(driver)/onboarding');
        } else {
          router.replace('/(driver)/(tabs)');
        }
        break;
      default:
        router.replace('/(auth)/login');
    }
  }, [user, loading, isFrameworkReady]);

  // Show loading screen while determining route
  return (
    <View style={{ 
      flex: 1, 
      justifyContent: 'center', 
      alignItems: 'center',
      backgroundColor: Colors.background 
    }}>
      <ActivityIndicator size="large" color={Colors.primary} />
    </View>
  );
}
