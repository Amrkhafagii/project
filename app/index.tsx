import React, { useEffect } from 'react';
import { View, ActivityIndicator, Text } from 'react-native';
import { router, SplashScreen } from 'expo-router';
import { useAuth } from '@/hooks/useAuth';
import { Colors } from '@/constants';
import { useFrameworkReady } from '@/hooks/useFrameworkReady';

export default function IndexScreen() {
  // Initialize with default values to prevent errors
  const auth = { user: null, loading: true };
  
  // Safely try to use the auth hook
  try {
    Object.assign(auth, useAuth());
  } catch (error) {
    console.error('Auth provider not available:', error);
    // Keep default values and show appropriate UI
  }
  
  const { user, loading } = auth;
  const isFrameworkReady = useFrameworkReady();

  useEffect(() => {
    if (!isFrameworkReady || loading) return;

    if (!user) {
      // No user, redirect to welcome screen
      setTimeout(() => {
        router.replace('/(auth)/welcome');
      }, 100);
      return;
    }

    // Check if user needs to complete role selection
    if (!user.role) {
      setTimeout(() => {
        router.replace('/(auth)/role-selection');
      }, 100);
      return;
    }

    // Redirect based on user role
    switch (user.role) {
      case 'customer':
        // Check if customer has completed onboarding
        if (!user.onboarded) {
          setTimeout(() => {
            router.replace('/(customer)/onboarding');
          }, 100);
          return;
        }
        setTimeout(() => {
          router.replace('/(customer)/(tabs)');
        }, 100);
        break;
      case 'restaurant':
        // Check if restaurant needs onboarding
        if (!user.onboarded) {
          setTimeout(() => {
            router.replace('/(restaurant)/onboarding');
          }, 100);
          return;
        }
        // Check if restaurant needs onboarding
        if (!user.onboarded) {
          setTimeout(() => {
            router.replace('/(restaurant)/onboarding');
          }, 100);
        } else {
          setTimeout(() => {
            router.replace('/(restaurant)/(tabs)');
          }, 100);
        }
        break;
      case 'driver':
        // Check if driver needs onboarding
        if (!user.onboarded) {
          setTimeout(() => {
            router.replace('/(driver)/onboarding');
          }, 100);
          return;
        }
        // Check if driver needs onboarding
        if (!user.onboarded) {
          setTimeout(() => {
            router.replace('/(driver)/onboarding');
          }, 100);
        } else {
          setTimeout(() => {
            router.replace('/(driver)/(tabs)');
          }, 100);
        }
        break;
      default:
        setTimeout(() => {
          router.replace('/(auth)/login');
        }, 100);
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
      {loading && <ActivityIndicator size="large" color={Colors.primary} />}
      {!loading && (
        <Text style={{ color: Colors.textSecondary, marginTop: 10 }}>
          Initializing app...
        </Text>
      )}
    </View>
  );