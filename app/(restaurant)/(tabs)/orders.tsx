import React from 'react';
import {
  View,
  Text,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '@/services/auth/authService';
import { LoadingSpinner } from '@/features/shared/components/LoadingSpinner';
import { OrderManagementDashboard } from '@/features/restaurant/components';

export default function RestaurantOrdersScreen() {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!user || user.user_metadata?.role !== 'restaurant') {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>
          Only restaurant accounts can access this page.
        </Text>
      </View>
    );
  }

  // Normally we would get the restaurant ID from the user's metadata
  const restaurantId = user.id || 'restaurant_1';

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Orders</Text>
      </View>
      <OrderManagementDashboard restaurantId={restaurantId} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#111827',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: '#EF4444',
    textAlign: 'center',
  },
});
