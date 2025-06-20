import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator, Text, Platform, StyleSheet, TouchableOpacity, AppState } from 'react-native';
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
  
  const [networkError, setNetworkError] = useState<string | null>(null);

  useEffect(() => {
    if (!isFrameworkReady || loading) return;
    
    // Clear any previous network errors when auth state changes
    setNetworkError(null);

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
  
  // Handle unexpected errors during auth/navigation
  useEffect(() => {
    const handleNetworkError = (error: any) => {
      console.error('Network error during navigation:', error?.message || error);
      setNetworkError('Network connection issue. Please check your connection and try again.');
    };
    
    // Platform-specific error handling
    if (Platform.OS === 'web') {
      // Web platform: use window.addEventListener
      window.addEventListener('error', handleNetworkError);
      
      return () => {
        window.removeEventListener('error', handleNetworkError);
      };
    } else {
      // Native platforms (iOS/Android): use AppState for app status changes
      // This doesn't catch errors the same way, but helps detect when app comes back from background
      // which is often when network connectivity issues are detected
      const subscription = AppState.addEventListener('change', (nextAppState) => {
        if (nextAppState === 'active') {
          // Check if we have connectivity when app becomes active
          fetch('https://www.google.com', { method: 'HEAD', timeout: 5000 })
            .catch((error) => {
              handleNetworkError(error);
            });
        }
      });
      
      return () => {
        subscription.remove();
      };
    };
  }, []);

  // Show loading screen while determining route
  return (
    <View style={styles.container}>
      {loading && <ActivityIndicator size="large" color={Colors.primary} />}
      
      {networkError ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorTitle}>Connection Error</Text>
          <Text style={styles.errorMessage}>
            {networkError}
            {Platform.OS !== 'web' ? "\n\nPlease check your internet connection." : ""}
          </Text>
          {Platform.OS !== 'web' && (
            <TouchableOpacity 
              style={styles.retryButton}
              onPress={() => {
                setNetworkError(null);
                router.replace('/');
              }}
            >
              <Text style={styles.retryText}>Retry Connection</Text>
            </TouchableOpacity>
          )}
        </View>
      ) : null}
      
      {!loading && (
        <Text style={{ color: Colors.textSecondary, marginTop: 10 }}>
          Initializing app...
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background
  },
  errorContainer: {
    padding: 20,
    alignItems: 'center',
    maxWidth: 300,
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.error,
    marginBottom: 10,
  },
  errorMessage: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: Colors.primary,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginTop: 10,
  },
  retryText: {
    color: Colors.white,
    fontWeight: '600',
  }
});