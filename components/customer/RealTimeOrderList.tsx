import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity, 
  RefreshControl,
  Alert 
} from 'react-native';
import { Package, ChevronRight, Clock, MapPin, AlertCircle } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { getRealTimeManager } from '@/services/realtime/realTimeManager';
import { Colors, Layout } from '@/constants';
import { EmptyState } from '@/app/_components/common/EmptyState';
import { Card } from '@/app/_components/common/Card';

interface Order {
  id: string;
  restaurantName: string;
  status: string;
  totalAmount: number;
  items: Array<{ name: string; quantity: number }>;
  orderDate: string;
  estimatedDeliveryTime?: string;
  hasUpdates?: boolean;
}

export function RealTimeOrderList() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [isConnected, setIsConnected] = useState(true);
  
  useEffect(() => {
    // Load initial orders
    loadOrders();
    
    // Setup real-time connection
    const realTimeManager = getRealTimeManager();
    if (realTimeManager) {
      // Subscribe to order updates
      const orderUpdateSubscription = realTimeManager.subscribe('order_status_changed', (data) => {
        updateOrderStatus(data.orderId, data.status);
      });
      
      // Subscribe to connection status
      const connectionSubscription = realTimeManager.subscribe('connection', (data) => {
        setIsConnected(data.status === 'connected');
      });
      
      return () => {
        orderUpdateSubscription();
        connectionSubscription();
      };
    }
    
    // Mock order updates for demo
    const interval = setInterval(() => {
      const randomIndex = Math.floor(Math.random() * orders.length);
      if (orders[randomIndex]) {
        const statusOptions = ['confirmed', 'preparing', 'ready', 'picked_up', 'on_the_way', 'delivered'];
        const currentStatusIndex = statusOptions.indexOf(orders[randomIndex].status);
        if (currentStatusIndex >= 0 && currentStatusIndex < statusOptions.length - 1) {
          const newStatus = statusOptions[currentStatusIndex + 1];
          updateOrderStatus(orders[randomIndex].id, newStatus);
        }
      }
    }, 30000); // Update every 30 seconds
    
    return () => clearInterval(interval);
  }, [orders.length]);
  
  const loadOrders = async () => {
    setRefreshing(true);
    
    // In a real app, fetch from API
    // For now, use mock data
    const mockOrders: Order[] = [
      {
        id: 'order_1',
        restaurantName: 'Green Bowl Kitchen',
        status: 'confirmed',
        totalAmount: 32.97,
        items: [
          { name: 'Grilled Salmon Power Bowl', quantity: 1 },
          { name: 'Green Smoothie', quantity: 1 },
        ],
        orderDate: new Date(Date.now() - 2000000).toISOString(),
        estimatedDeliveryTime: new Date(Date.now() + 1800000).toISOString(), // 30 min from now
      },
      {
        id: 'order_2',
        restaurantName: 'Protein Palace',
        status: 'preparing',
        totalAmount: 45.50,
        items: [
          { name: 'Protein-Packed Bowl', quantity: 2 },
          { name: 'Protein Shake', quantity: 1 },
        ],
        orderDate: new Date(Date.now() - 5000000).toISOString(),
        estimatedDeliveryTime: new Date(Date.now() + 1200000).toISOString(), // 20 min from now
      },
      {
        id: 'order_3',
        restaurantName: 'Fresh & Fit',
        status: 'delivered',
        totalAmount: 28.45,
        items: [
          { name: 'Keto Power Plate', quantity: 1 },
          { name: 'Avocado Side', quantity: 1 },
        ],
        orderDate: new Date(Date.now() - 86400000).toISOString(), // Yesterday
      },
    ];
    
    setOrders(mockOrders);
    setRefreshing(false);
  };
  
  const updateOrderStatus = (orderId: string, status: string) => {
    setOrders(prev => prev.map(order => {
      if (order.id === orderId) {
        return {
          ...order,
          status,
          hasUpdates: true, // Mark that this order has been updated
        };
      }
      return order;
    }));
  };
  
  const handleRefresh = () => {
    loadOrders();
  };
  
  const handleOrderPress = (orderId: string) => {
    // Clear updates flag when opening the order
    setOrders(prev => prev.map(order => {
      if (order.id === orderId) {
        return {
          ...order,
          hasUpdates: false,
        };
      }
      return order;
    }));
    
    // Navigate to order tracking
    router.push(`/order-tracking?orderId=${orderId}`);
  };
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return Colors.info;
      case 'preparing':
      case 'ready':
        return Colors.warning;
      case 'picked_up':
      case 'on_the_way':
        return Colors.primary;
      case 'delivered':
        return Colors.success;
      default:
        return Colors.textSecondary;
    }
  };
  
  const formatStatus = (status: string) => {
    return status.charAt(0).toUpperCase() + status.slice(1).replace(/_/g, ' ');
  };
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
  };
  
  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };
  
  const getActiveOrders = () => {
    return orders.filter(order => order.status !== 'delivered' && order.status !== 'cancelled');
  };
  
  const getPastOrders = () => {
    return orders.filter(order => order.status === 'delivered' || order.status === 'cancelled');
  };
  
  const activeOrders = getActiveOrders();
  const pastOrders = getPastOrders();
  
  const renderOrder = ({ item }: { item: Order }) => {
    const isActive = item.status !== 'delivered' && item.status !== 'cancelled';
    const statusColor = getStatusColor(item.status);
    
    return (
      <TouchableOpacity onPress={() => handleOrderPress(item.id)}>
        <Card 
          style={[
            styles.orderCard, 
            item.hasUpdates && styles.updatedOrderCard
          ]}
          shadow={isActive}
        >
          <View style={styles.orderHeader}>
            <Text style={styles.restaurantName}>{item.restaurantName}</Text>
            <View style={[styles.statusBadge, { backgroundColor: statusColor + '15' }]}>
              <Text style={[styles.statusText, { color: statusColor }]}>
                {formatStatus(item.status)}
              </Text>
            </View>
          </View>
          
          <View style={styles.orderContent}>
            <View style={styles.orderInfo}>
              <View style={styles.orderDetail}>
                <Package size={16} color={Colors.textSecondary} />
                <Text style={styles.orderDetailText}>
                  {item.items.map(i => `${i.quantity}x ${i.name}`).join(', ')}
                </Text>
              </View>
              
              <View style={styles.orderDetail}>
                <Clock size={16} color={Colors.textSecondary} />
                <Text style={styles.orderDetailText}>
                  {formatDate(item.orderDate)} • {formatTime(item.orderDate)}
                </Text>
              </View>
              
              {item.estimatedDeliveryTime && (
                <View style={styles.orderDetail}>
                  <MapPin size={16} color={statusColor} />
                  <Text style={[styles.orderDetailText, { color: statusColor }]}>
                    {isActive ? 'Estimated delivery: ' : ''}
                    {formatTime(item.estimatedDeliveryTime)}
                  </Text>
                </View>
              )}
            </View>
            
            <View style={styles.orderPrice}>
              <Text style={styles.priceText}>${item.totalAmount.toFixed(2)}</Text>
              <ChevronRight size={20} color={Colors.textSecondary} />
            </View>
          </View>
          
          {item.hasUpdates && (
            <View style={styles.updateBadge}>
              <Text style={styles.updateBadgeText}>New Update</Text>
            </View>
          )}
        </Card>
      </TouchableOpacity>
    );
  };
  
  return (
    <View style={styles.container}>
      {!isConnected && (
        <View style={styles.offlineWarning}>
          <AlertCircle size={16} color={Colors.white} />
          <Text style={styles.offlineWarningText}>
            You're offline. Order updates will resume when connection is restored.
          </Text>
        </View>
      )}
    
      {activeOrders.length > 0 ? (
        <>
          <Text style={styles.sectionTitle}>Active Orders</Text>
          <FlatList
            data={activeOrders}
            renderItem={renderOrder}
            keyExtractor={item => item.id}
            contentContainerStyle={styles.ordersList}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={handleRefresh}
                colors={[Colors.primary]}
              />
            }
          />
        </>
      ) : (
        <EmptyState
          Icon={Package}
          title="No Active Orders"
          description="When you place an order, you'll be able to track it here in real-time."
          action={
            <TouchableOpacity 
              style={styles.browseButton}
              onPress={() => router.push('/browse')}
            >
              <Text style={styles.browseButtonText}>Browse Restaurants</Text>
            </TouchableOpacity>
          }
        />
      )}
      
      {pastOrders.length > 0 && (
        <>
          <Text style={styles.sectionTitle}>Past Orders</Text>
          {pastOrders.map(order => renderOrder({ item: order }))}
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: Layout.spacing.md,
  },
  offlineWarning: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.error,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 12,
  },
  offlineWarningText: {
    color: Colors.white,
    fontSize: 14,
    marginLeft: 8,
    flex: 1,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 12,
    marginTop: 8,
  },
  ordersList: {
    paddingBottom: 16,
  },
  orderCard: {
    marginBottom: 12,
  },
  updatedOrderCard: {
    borderColor: Colors.primary,
    borderWidth: 2,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  restaurantName: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  orderContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  orderInfo: {
    flex: 1,
  },
  orderDetail: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  orderDetailText: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginLeft: 8,
    flex: 1,
  },
  orderPrice: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  priceText: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text,
    marginRight: 8,
  },
  updateBadge: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: Colors.primary,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  updateBadgeText: {
    fontSize: 10,
    fontWeight: '600',
    color: Colors.white,
  },
  browseButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 16,
  },
  browseButtonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
});

export default RealTimeOrderList;