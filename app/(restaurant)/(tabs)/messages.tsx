import React from 'react';
import {
  View,
  Text,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '@/hooks/useAuth';
import { LoadingSpinner } from '@/features/shared/components/LoadingSpinner';
import { MessagingCenter } from '@/features/restaurant/components';

export default function RestaurantMessagesScreen() {
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
    <MessagingCenter restaurantId={restaurantId} />
  );
}

const styles = StyleSheet.create({
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
