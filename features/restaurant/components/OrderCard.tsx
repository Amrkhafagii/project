import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
} from 'react-native';
import { MapPin, Clock, DollarSign, ChevronRight, CircleCheck as Check, Circle as X } from 'lucide-react-native';
import { OrderStatusBadge } from '@/features/shared/components/OrderStatusBadge';

interface OrderItem {
  id: string;
  menuItemId: string;
  name: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  specialInstructions?: string;
}

interface Order {
  id: string;
  status: string;
  customer: {
    id: string;
    name: string;
    address: string;
    phoneNumber: string;
  };
  items: OrderItem[];
  subtotal: number;
  deliveryFee: number;
  taxAmount: number;
  totalAmount: number;
  createdAt: string;
  estimatedDeliveryTime?: string;
  specialInstructions?: string;
}

interface OrderCardProps {
  order: Order;
  onPress: () => void;
  onAccept: () => void;
  onReject: () => void;
  onUpdateStatus: (status: string) => void;
}

export function OrderCard({ order, onPress, onAccept, onReject, onUpdateStatus }: OrderCardProps) {
  const [expanded, setExpanded] = useState(false);

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getTotalItems = () => {
    return order.items.reduce((sum, item) => sum + item.quantity, 0);
  };

  const handlePress = () => {
    if (expanded) {
      setExpanded(false);
    } else {
      onPress();
    }
  };

  const renderActionButtons = () => {
    switch (order.status) {
      case 'pending':
      case 'restaurant_assigned':
        return (
          <View style={styles.actionButtons}>
            <TouchableOpacity style={styles.rejectButton} onPress={onReject}>
              <X size={16} color="#EF4444" />
              <Text style={styles.rejectButtonText}>Reject</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.acceptButton} onPress={onAccept}>
              <Check size={16} color="#FFFFFF" />
              <Text style={styles.acceptButtonText}>Accept</Text>
            </TouchableOpacity>
          </View>
        );
      case 'accepted':
        return (
          <View style={styles.actionButtons}>
            <TouchableOpacity 
              style={styles.statusButton} 
              onPress={() => onUpdateStatus('preparing')}
            >
              <Text style={styles.statusButtonText}>Start Preparing</Text>
            </TouchableOpacity>
          </View>
        );
      case 'preparing':
        return (
          <View style={styles.actionButtons}>
            <TouchableOpacity 
              style={styles.statusButton} 
              onPress={() => onUpdateStatus('ready')}
            >
              <Text style={styles.statusButtonText}>Mark Ready for Pickup</Text>
            </TouchableOpacity>
          </View>
        );
      case 'ready':
        return (
          <View style={styles.actionButtons}>
            <TouchableOpacity 
              style={styles.statusButton} 
              onPress={() => onUpdateStatus('picked_up')}
            >
              <Text style={styles.statusButtonText}>Picked Up by Driver</Text>
            </TouchableOpacity>
          </View>
        );
      default:
        return null;
    }
  };

  return (
    <TouchableOpacity 
      style={[
        styles.container,
        (order.status === 'pending' || order.status === 'restaurant_assigned') && styles.newOrderHighlight
      ]}
      onPress={handlePress}
      activeOpacity={0.7}
    >
      <View style={styles.header}>
        <View style={styles.orderInfo}>
          <Text style={styles.orderNumber}>Order #{order.id.slice(-6)}</Text>
          <Text style={styles.orderTime}>{formatTime(order.createdAt)}</Text>
        </View>
        <OrderStatusBadge status={order.status as any} />
      </View>

      <View style={styles.customerSection}>
        <Text style={styles.customerName}>{order.customer.name}</Text>
        <View style={styles.detailRow}>
          <MapPin size={14} color="#6B7280" />
          <Text style={styles.detailText} numberOfLines={1}>
            {order.customer.address}
          </Text>
        </View>
      </View>

      <View style={styles.divider} />

      <View style={styles.orderDetails}>
        <View style={styles.detailItem}>
          <Clock size={16} color="#6B7280" />
          <Text style={styles.detailText}>
            {new Date(order.createdAt).toLocaleDateString()}
          </Text>
        </View>
        <View style={styles.detailItem}>
          <Text style={styles.itemsCount}>{getTotalItems()} items</Text>
        </View>
        <View style={styles.detailItem}>
          <DollarSign size={16} color="#10B981" />
          <Text style={styles.totalAmount}>${order.totalAmount.toFixed(2)}</Text>
        </View>
      </View>

      {renderActionButtons()}

      <View style={styles.expandButtonContainer}>
        <TouchableOpacity 
          style={styles.expandButton}
          onPress={() => setExpanded(!expanded)}
        >
          <Text style={styles.expandButtonText}>
            {expanded ? 'Hide details' : 'View details'}
          </Text>
          <ChevronRight 
            size={16} 
            color="#6B7280" 
            style={{ 
              transform: [{ rotate: expanded ? '90deg' : '0deg' }] 
            }}
          />
        </TouchableOpacity>
      </View>

      {expanded && (
        <View style={styles.expandedContent}>
          <Text style={styles.expandedSectionTitle}>Order Items</Text>
          {order.items.map((item) => (
            <View key={item.id} style={styles.orderItem}>
              <View style={styles.itemInfo}>
                <Text style={styles.itemQuantity}>{item.quantity}x</Text>
                <Text style={styles.itemName}>{item.name}</Text>
              </View>
              <Text style={styles.itemPrice}>${item.totalPrice.toFixed(2)}</Text>
            </View>
          ))}

          {order.specialInstructions && (
            <View style={styles.specialInstructions}>
              <Text style={styles.expandedSectionTitle}>Special Instructions</Text>
              <Text style={styles.specialInstructionsText}>
                {order.specialInstructions}
              </Text>
            </View>
          )}

          <View style={styles.priceSummary}>
            <View style={styles.priceRow}>
              <Text style={styles.priceLabel}>Subtotal</Text>
              <Text style={styles.priceValue}>${order.subtotal.toFixed(2)}</Text>
            </View>
            <View style={styles.priceRow}>
              <Text style={styles.priceLabel}>Delivery Fee</Text>
              <Text style={styles.priceValue}>${order.deliveryFee.toFixed(2)}</Text>
            </View>
            <View style={styles.priceRow}>
              <Text style={styles.priceLabel}>Tax</Text>
              <Text style={styles.priceValue}>${order.taxAmount.toFixed(2)}</Text>
            </View>
            <View style={[styles.priceRow, styles.totalRow]}>
              <Text style={styles.totalLabel}>Total</Text>
              <Text style={styles.totalValue}>${order.totalAmount.toFixed(2)}</Text>
            </View>
          </View>
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    overflow: 'hidden',
  },
  newOrderHighlight: {
    borderLeftWidth: 4,
    borderLeftColor: '#F59E0B',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    paddingBottom: 8,
  },
  orderInfo: {
    flex: 1,
  },
  orderNumber: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  orderTime: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  customerSection: {
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  customerName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 4,
  },
  divider: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginHorizontal: 16,
  },
  orderDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    paddingTop: 12,
    paddingBottom: 12,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  detailText: {
    fontSize: 14,
    color: '#6B7280',
    marginLeft: 4,
  },
  itemsCount: {
    fontSize: 14,
    color: '#6B7280',
  },
  totalAmount: {
    fontSize: 16,
    fontWeight: '600',
    color: '#10B981',
    marginLeft: 4,
  },
  actionButtons: {
    flexDirection: 'row',
    padding: 16,
    paddingTop: 0,
    paddingBottom: 12,
  },
  acceptButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#10B981',
    paddingVertical: 10,
    borderRadius: 8,
    marginLeft: 8,
  },
  acceptButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 4,
  },
  rejectButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F3F4F6',
    paddingVertical: 10,
    borderRadius: 8,
    marginRight: 8,
  },
  rejectButtonText: {
    color: '#EF4444',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 4,
  },
  statusButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#10B981',
    paddingVertical: 10,
    borderRadius: 8,
  },
  statusButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  expandButtonContainer: {
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    paddingHorizontal: 16,
  },
  expandButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
  },
  expandButtonText: {
    fontSize: 14,
    color: '#6B7280',
  },
  expandedContent: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  expandedSectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  orderItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  itemInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  itemQuantity: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
    marginRight: 8,
  },
  itemName: {
    fontSize: 14,
    color: '#111827',
    flex: 1,
  },
  itemPrice: {
    fontSize: 14,
    fontWeight: '500',
    color: '#111827',
  },
  specialInstructions: {
    backgroundColor: '#F9FAFB',
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
    marginBottom: 16,
  },
  specialInstructionsText: {
    fontSize: 14,
    color: '#4B5563',
    fontStyle: 'italic',
  },
  priceSummary: {
    marginTop: 8,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  priceLabel: {
    fontSize: 14,
    color: '#6B7280',
  },
  priceValue: {
    fontSize: 14,
    color: '#374151',
  },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    paddingTop: 8,
    marginTop: 4,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  totalValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
});
