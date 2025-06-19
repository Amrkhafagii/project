import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { OrderStatus } from '@/types/common';
import { COLORS, SPACING, TYPOGRAPHY, BORDER_RADIUS } from '@/utils/constants';

interface OrderStatusBadgeProps {
  status: OrderStatus;
  size?: 'small' | 'medium';
}

export function OrderStatusBadge({ status, size = 'medium' }: OrderStatusBadgeProps) {
  const getStatusConfig = (status: OrderStatus) => {
    switch (status) {
      case OrderStatus.PENDING:
        return { color: COLORS.warning, text: 'Pending' };
      case OrderStatus.CONFIRMED:
        return { color: COLORS.primary, text: 'Confirmed' };
      case OrderStatus.PREPARING:
        return { color: '#FF9500', text: 'Preparing' };
      case OrderStatus.READY:
        return { color: COLORS.success, text: 'Ready' };
      case OrderStatus.PICKED_UP:
        return { color: '#5856D6', text: 'Picked Up' };
      case OrderStatus.DELIVERED:
        return { color: COLORS.success, text: 'Delivered' };
      case OrderStatus.CANCELLED:
        return { color: COLORS.error, text: 'Cancelled' };
      default:
        return { color: COLORS.textSecondary, text: 'Unknown' };
    }
  };

  const config = getStatusConfig(status);

  return (
    <View style={[
      styles.badge,
      styles[size],
      { backgroundColor: `${config.color}20` }
    ]}>
      <Text style={[
        styles.text,
        styles[`${size}Text`],
        { color: config.color }
      ]}>
        {config.text}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    borderRadius: BORDER_RADIUS.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  small: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
  },
  medium: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
  },
  text: {
    fontWeight: TYPOGRAPHY.weights.medium,
  },
  smallText: {
    fontSize: TYPOGRAPHY.sizes.xs,
  },
  mediumText: {
    fontSize: TYPOGRAPHY.sizes.sm,
  },
});
