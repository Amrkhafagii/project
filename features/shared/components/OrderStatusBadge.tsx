import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export type OrderStatus = 'pending' | 'confirmed' | 'preparing' | 'ready' | 'delivered' | 'cancelled';

interface OrderStatusBadgeProps {
  status: OrderStatus;
}

const statusConfig = {
  pending: { label: 'Pending', color: '#F59E0B', backgroundColor: '#FEF3C7' },
  confirmed: { label: 'Confirmed', color: '#3B82F6', backgroundColor: '#DBEAFE' },
  preparing: { label: 'Preparing', color: '#8B5CF6', backgroundColor: '#EDE9FE' },
  ready: { label: 'Ready', color: '#10B981', backgroundColor: '#D1FAE5' },
  delivered: { label: 'Delivered', color: '#059669', backgroundColor: '#A7F3D0' },
  cancelled: { label: 'Cancelled', color: '#EF4444', backgroundColor: '#FEE2E2' },
};

export function OrderStatusBadge({ status }: OrderStatusBadgeProps) {
  const config = statusConfig[status];

  return (
    <View style={[styles.badge, { backgroundColor: config.backgroundColor }]}>
      <Text style={[styles.text, { color: config.color }]}>{config.label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  text: {
    fontSize: 12,
    fontWeight: '600',
  },
});
