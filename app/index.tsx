import { useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { useAuth } from '@/hooks/useAuth';
import { Colors } from '@/constants';

export default function IndexScreen() {
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading) {
      console.log('[IndexScreen] Auth loading complete, user:', user?.email, 'role:', user?.role);
      
      if (!user) {
        console.log('[IndexScreen] No user, redirecting to welcome');
        router.replace('/(auth)/welcome');
      } else {
        // Navigate based on user role
        console.log('[IndexScreen] User authenticated, navigating to role:', user.role);
        switch (user.role) {
          case 'customer':
            router.replace('/(customer)/home');
            break;
          case 'restaurant':
            router.replace('/(restaurant)/dashboard');
            break;
          case 'driver':
            router.replace('/(driver)/dashboard');
            break;
          default:
            console.error('[IndexScreen] Unknown user role:', user.role);
            router.replace('/(auth)/welcome');
        }
      }
    }
  }, [user, loading]);

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color={Colors.primary} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
  },
});
