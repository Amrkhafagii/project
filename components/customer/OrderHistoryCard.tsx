import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Star, Clock, MapPin } from 'lucide-react-native';
import { Colors } from '@/constants';

interface OrderHistoryCardProps {
  order: {
    id: string;
    restaurantName: string;
    restaurantImage: string;
    orderNumber: string;
    orderDate: Date;
    items: Array<{ name: string; quantity: number }>;
    total: number;
    status: string;
    rating?: number;
  };
  onPress: () => void;
  onReorder: () => void;
}

export function OrderHistoryCard({ order, onPress, onReorder }: OrderHistoryCardProps) {
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    }).format(date);
  };

  const getItemsText = () => {
    const firstItem = order.items[0];
    const remainingCount = order.items.length - 1;
    
    if (remainingCount === 0) {
      return firstItem.name;
    }
    
    return `${firstItem.name} + ${remainingCount} item${remainingCount > 1 ? 's' : ''}`;
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'delivered':
        return Colors.success;
      case 'cancelled':
        return Colors.error;
      case 'preparing':
        return Colors.warning;
      default:
        return Colors.textSecondary;
    }
  };

  return (
    <TouchableOpacity style={styles.container} onPress={onPress}>
      <View style={styles.content}>
        <View style={styles.header}>
          <Image source={{ uri: order.restaurantImage }} style={styles.restaurantImage} />
          <View style={styles.headerInfo}>
            <Text style={styles.restaurantName}>{order.restaurantName}</Text>
            <Text style={styles.orderDate}>{formatDate(order.orderDate)}</Text>
          </View>
        </View>

        <View style={styles.orderInfo}>
          <Text style={styles.itemsText}>{getItemsText()}</Text>
          
          <View style={styles.orderMeta}>
            <Text style={styles.total}>${order.total.toFixed(2)}</Text>
            
            {order.rating && (
              <View style={styles.rating}>
                <Star size={14} color={Colors.warning} fill={Colors.warning} />
                <Text style={styles.ratingText}>{order.rating.toFixed(1)}</Text>
              </View>
            )}
            
            <View style={styles.statusContainer}>
              <View style={[styles.statusDot, { backgroundColor: getStatusColor(order.status) }]} />
              <Text style={[styles.status, { color: getStatusColor(order.status) }]}>
                {order.status}
              </Text>
            </View>
          </View>
        </View>

        <TouchableOpacity style={styles.reorderButton} onPress={onReorder}>
          <Text style={styles.reorderText}>Reorder</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  content: {
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  restaurantImage: {
    width: 48,
    height: 48,
    borderRadius: 8,
    marginRight: 12,
  },
  headerInfo: {
    flex: 1,
  },
  restaurantName: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 2,
  },
  orderDate: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  orderInfo: {
    marginBottom: 16,
  },
  itemsText: {
    fontSize: 14,
    color: Colors.text,
    marginBottom: 8,
  },
  orderMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  total: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
  },
  rating: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginLeft: 4,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  status: {
    fontSize: 14,
    fontWeight: '500',
    textTransform: 'capitalize',
  },
  reorderButton: {
    backgroundColor: Colors.customer,
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 16,
    alignSelf: 'flex-end',
  },
  reorderText: {
    color: Colors.white,
    fontSize: 14,
    fontWeight: '600',
  },
});
