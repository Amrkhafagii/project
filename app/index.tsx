import { useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { Redirect } from 'expo-router';
import { useAuth } from '@/hooks/useAuth';
import { Colors } from '@/constants';
import { ROLE_CONFIG } from '@/constants/auth';

export default function Index() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  if (!user) {
    return <Redirect href="/(auth)/welcome" />;
  }

  if (!user.role) {
    return <Redirect href="/(auth)/role-selection" />;
  }

  const roleConfig = ROLE_CONFIG[user.role];
  if (roleConfig) {
    return <Redirect href={roleConfig.defaultRoute as any} />;
  }

  // Fallback to customer if role is not recognized
  return <Redirect href="/(customer)" />;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
  },
});
