import React from 'react';
import { 
  View,
  StyleSheet,
  SafeAreaView
} from 'react-native';
import { useAuth } from '@/hooks/useAuth';
import { Colors } from '@/constants';
import RealTimeOrderList from '@/components/customer/RealTimeOrderList';

export default function OrdersScreen() {
  const { user } = useAuth();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View>
            <Text style={styles.headerTitle}>My Orders</Text>
            <Text style={styles.headerSubtitle}>Track your orders in real-time</Text>
          </View>
        </View>
      </View>
      
      <View style={styles.content}>
        <RealTimeOrderList />
      </View>
    </SafeAreaView>
  );
}

const Text = ({ style, ...props }) => (
  <ReactText style={[{ color: Colors.text }, style]} {...props} />
);

import { Text as ReactText } from 'react-native';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    backgroundColor: Colors.white,
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  content: {
    flex: 1,
  },
});