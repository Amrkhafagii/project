import { useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { Colors } from '@/constants';
import { useAuth } from '@/contexts/AuthContext';
import { ROLE_CONFIG } from '@/constants/auth';

export default function Index() {
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading) {
      if (user) {
        // User is authenticated, redirect to their dashboard
        const roleConfig = ROLE_CONFIG[user.role];
        if (roleConfig) {
          router.replace(roleConfig.defaultRoute as any);
        }
      } else {
        // User is not authenticated, redirect to welcome
        router.replace('/(auth)/welcome');
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
