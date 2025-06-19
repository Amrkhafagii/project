import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MapPin, Clock, DollarSign, Navigation, Phone, MessageCircle, Package, CircleCheck as CheckCircle, Circle as XCircle } from 'lucide-react-native';
import { optimizeDeliveryRoute, calculateETAWithTraffic } from '@/services/delivery/deliveryOptimization';

interface OrderAssignment {
  id: string;
  orderId: string;
  customerName: string;
  customerPhone: string;
  pickupAddress: string;
  deliveryAddress: string;
  pickupCoords: { latitude: number; longitude: number };
  deliveryCoords: { latitude: number; longitude: number };
  items: number;
  total: number;
  priority: number;
  estimatedEarnings: number;
  distance: number;
  status: 'pending' | 'accepted' | 'picked_up' | 'delivered';
  timeRemaining: number; // seconds to accept
  restaurantName: string;
}

export default function DriverOrders() {
  const [orders, setOrders] = useState<OrderAssignment[]>([]);
  const [activeOrders, setActiveOrders] = useState<OrderAssignment[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  // Mock driver location
  const driverLocation = {
    latitude: 40.7128,
    longitude: -74.0060,
  };

  useEffect(() => {
    loadOrders();
    // Simulate real-time order updates
    const interval = setInterval(() => {
      updateOrderTimers();
      checkForNewOrders();
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const loadOrders = () => {
    // Mock pending orders
    const mockOrders: OrderAssignment[] = [
      {
        id: '1',
        orderId: 'ORD-001',
        customerName: 'Sarah Johnson',
        customerPhone: '+1 (555) 123-4567',
        pickupAddress: 'Green Bowl Kitchen, 123 Health St',
        deliveryAddress: '456 Wellness Ave, Apt 2B',
        pickupCoords: { latitude: 40.7580, longitude: -73.9855 },
        deliveryCoords: { latitude: 40.7589, longitude: -73.9851 },
        items: 3,
        total: 42.50,
        priority: 4,
        estimatedEarnings: 12.75,
        distance: 2.3,
        status: 'pending',
        timeRemaining: 45,
        restaurantName: 'Green Bowl Kitchen',
      },
      {
        id: '2',
        orderId: 'ORD-002',
        customerName: 'Mike Chen',
        customerPhone: '+1 (555) 987-6543',
        pickupAddress: 'Protein Palace, 789 Fitness Blvd',
        deliveryAddress: '321 Gym Street, Suite 5',
        pickupCoords: { latitude: 40.7614, longitude: -73.9776 },
        deliveryCoords: { latitude: 40.7505, longitude: -73.9934 },
        items: 2,
        total: 28.99,
        priority: 5,
        estimatedEarnings: 9.50,
        distance: 1.8,
        status: 'pending',
        timeRemaining: 67,
        restaurantName: 'Protein Palace',
      },
    ];

    setOrders(mockOrders);
  };

  const updateOrderTimers = () => {
    setOrders(prev => prev.map(order => ({
      ...order,
      timeRemaining: Math.max(0, order.timeRemaining - 1),
    })).filter(order => order.timeRemaining > 0 || order.status !== 'pending'));
  };

  const checkForNewOrders = () => {
    // Simulate new orders arriving
    if (Math.random() < 0.02) { // 2% chance per second
      const newOrder: OrderAssignment = {
        id: Date.now().toString(),
        orderId: `ORD-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
        customerName: 'New Customer',
        customerPhone: '+1 (555) 000-0000',
        pickupAddress: 'Restaurant Location',
        deliveryAddress: 'Customer Address',
        pickupCoords: { 
          latitude: 40.7128 + (Math.random() - 0.5) * 0.02, 
          longitude: -74.0060 + (Math.random() - 0.5) * 0.02 
        },
        deliveryCoords: { 
          latitude: 40.7128 + (Math.random() - 0.5) * 0.02, 
          longitude: -74.0060 + (Math.random() - 0.5) * 0.02 
        },
        items: Math.floor(Math.random() * 5) + 1,
        total: Math.random() * 50 + 15,
        priority: Math.floor(Math.random() * 5) + 1,
        estimatedEarnings: Math.random() * 10 + 5,
        distance: Math.random() * 5 + 0.5,
        status: 'pending',
        timeRemaining: 60,
        restaurantName: 'New Restaurant',
      };

      setOrders(prev => [newOrder, ...prev]);
    }
  };

  const acceptOrder = (order: OrderAssignment) => {
    Alert.alert(
      'Accept Order',
      `Accept order ${order.orderId} for $${order.estimatedEarnings.toFixed(2)} earnings?`,
      [
        { text: 'Decline', style: 'cancel' },
        {
          text: 'Accept',
          onPress: () => {
            setOrders(prev => prev.filter(o => o.id !== order.id));
            setActiveOrders(prev => [...prev, { ...order, status: 'accepted' }]);
            Alert.alert('Order Accepted', 'Navigate to pickup location');
          },
        },
      ]
    );
  };

  const declineOrder = (order: OrderAssignment) => {
    setOrders(prev => prev.filter(o => o.id !== order.id));
  };

  const updateOrderStatus = (orderId: string, newStatus: OrderAssignment['status']) => {
    setActiveOrders(prev => prev.map(order => 
      order.id === orderId ? { ...order, status: newStatus } : order
    ));

    if (newStatus === 'delivered') {
      setActiveOrders(prev => prev.filter(order => order.id !== orderId));
      Alert.alert('Delivery Complete', 'Payment has been processed to your account');
    }
  };

  const optimizeRoute = () => {
    if (activeOrders.length < 2) {
      Alert.alert('Route Optimization', 'Need at least 2 orders to optimize route');
      return;
    }

    const deliveryPoints = activeOrders.map(order => ({
      id: order.id,
      latitude: order.deliveryCoords.latitude,
      longitude: order.deliveryCoords.longitude,
      address: order.deliveryAddress,
      priority: order.priority,
      estimatedTime: 5,
    }));

    const startPoint = {
      id: 'driver',
      latitude: driverLocation.latitude,
      longitude: driverLocation.longitude,
      address: 'Current Location',
      priority: 1,
      estimatedTime: 0,
    };

    const optimizedRoute = optimizeDeliveryRoute(startPoint, deliveryPoints);
    
    Alert.alert(
      'Route Optimized',
      `Total distance: ${optimizedRoute.totalDistance.toFixed(1)}km\nEstimated time: ${optimizedRoute.totalTime}min`,
      [{ text: 'Start Navigation', onPress: () => {} }]
    );
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadOrders();
    setTimeout(() => setRefreshing(false), 1000);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Order Assignments</Text>
          {activeOrders.length > 1 && (
            <TouchableOpacity style={styles.optimizeButton} onPress={optimizeRoute}>
              <Text style={styles.optimizeButtonText}>Optimize Route</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Active Orders */}
        {activeOrders.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Active Deliveries ({activeOrders.length})</Text>
            {activeOrders.map((order) => (
              <View key={order.id} style={styles.activeOrderCard}>
                <View style={styles.orderHeader}>
                  <Text style={styles.orderId}>{order.orderId}</Text>
                  <View style={styles.statusBadge}>
                    <Text style={styles.statusText}>{order.status.toUpperCase()}</Text>
                  </View>
                </View>

                <Text style={styles.customerName}>{order.customerName}</Text>
                <Text style={styles.restaurantName}>{order.restaurantName}</Text>

                <View style={styles.addressSection}>
                  <View style={styles.addressItem}>
                    <MapPin size={16} color="#EF4444" />
                    <Text style={styles.addressText}>{order.pickupAddress}</Text>
                    <TouchableOpacity style={styles.navButton}>
                      <Navigation size={16} color="#10B981" />
                    </TouchableOpacity>
                  </View>
                  <View style={styles.addressItem}>
                    <MapPin size={16} color="#10B981" />
                    <Text style={styles.addressText}>{order.deliveryAddress}</Text>
                    <TouchableOpacity style={styles.navButton}>
                      <Navigation size={16} color="#10B981" />
                    </TouchableOpacity>
                  </View>
                </View>

                <View style={styles.orderActions}>
                  <TouchableOpacity 
                    style={styles.contactButton}
                    onPress={() => Alert.alert('Call Customer', order.customerPhone)}
                  >
                    <Phone size={16} color="#FFFFFF" />
                    <Text style={styles.contactButtonText}>Call</Text>
                  </TouchableOpacity>

                  {order.status === 'accepted' && (
                    <TouchableOpacity
                      style={styles.actionButton}
                      onPress={() => updateOrderStatus(order.id, 'picked_up')}
                    >
                      <Package size={16} color="#FFFFFF" />
                      <Text style={styles.actionButtonText}>Mark Picked Up</Text>
                    </TouchableOpacity>
                  )}

                  {order.status === 'picked_up' && (
                    <TouchableOpacity
                      style={styles.actionButton}
                      onPress={() => updateOrderStatus(order.id, 'delivered')}
                    >
                      <CheckCircle size={16} color="#FFFFFF" />
                      <Text style={styles.actionButtonText}>Mark Delivered</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Available Orders */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Available Orders ({orders.length})
          </Text>
          
          {orders.length === 0 ? (
            <View style={styles.emptyState}>
              <Package size={48} color="#D1D5DB" />
              <Text style={styles.emptyTitle}>No orders available</Text>
              <Text style={styles.emptySubtitle}>
                New orders will appear here when customers place them
              </Text>
            </View>
          ) : (
            orders.map((order) => (
              <View key={order.id} style={styles.orderCard}>
                <View style={styles.orderHeader}>
                  <Text style={styles.orderId}>{order.orderId}</Text>
                  <View style={styles.timerContainer}>
                    <Clock size={16} color="#F59E0B" />
                    <Text style={styles.timerText}>{formatTime(order.timeRemaining)}</Text>
                  </View>
                </View>

                <View style={styles.orderInfo}>
                  <Text style={styles.customerName}>{order.customerName}</Text>
                  <Text style={styles.restaurantName}>{order.restaurantName}</Text>
                </View>

                <View style={styles.orderDetails}>
                  <View style={styles.detailItem}>
                    <Package size={16} color="#6B7280" />
                    <Text style={styles.detailText}>{order.items} items</Text>
                  </View>
                  <View style={styles.detailItem}>
                    <MapPin size={16} color="#6B7280" />
                    <Text style={styles.detailText}>{order.distance.toFixed(1)} km</Text>
                  </View>
                  <View style={styles.detailItem}>
                    <DollarSign size={16} color="#10B981" />
                    <Text style={styles.earningsText}>${order.estimatedEarnings.toFixed(2)}</Text>
                  </View>
                </View>

                <View style={styles.orderActions}>
                  <TouchableOpacity
                    style={styles.declineButton}
                    onPress={() => declineOrder(order)}
                  >
                    <XCircle size={16} color="#EF4444" />
                    <Text style={styles.declineButtonText}>Decline</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                    style={styles.acceptButton}
                    onPress={() => acceptOrder(order)}
                  >
                    <CheckCircle size={16} color="#FFFFFF" />
                    <Text style={styles.acceptButtonText}>Accept</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  scrollContent: {
    paddingBottom: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#111827',
  },
  optimizeButton: {
    backgroundColor: '#3B82F6',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  optimizeButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 16,
  },
  orderCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  activeOrderCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: '#10B981',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  orderId: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  timerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  timerText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#92400E',
    marginLeft: 4,
  },
  statusBadge: {
    backgroundColor: '#10B981',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  orderInfo: {
    marginBottom: 12,
  },
  customerName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  restaurantName: {
    fontSize: 14,
    color: '#6B7280',
  },
  orderDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailText: {
    fontSize: 14,
    color: '#6B7280',
    marginLeft: 4,
  },
  earningsText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#10B981',
    marginLeft: 4,
  },
  addressSection: {
    marginBottom: 16,
  },
  addressItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  addressText: {
    flex: 1,
    fontSize: 14,
    color: '#111827',
    marginLeft: 8,
  },
  navButton: {
    padding: 8,
  },
  orderActions: {
    flexDirection: 'row',
    gap: 12,
  },
  acceptButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#10B981',
    paddingVertical: 12,
    borderRadius: 8,
  },
  acceptButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 4,
  },
  declineButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
  },
  declineButtonText: {
    color: '#EF4444',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 4,
  },
  contactButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#3B82F6',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  contactButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#10B981',
    paddingVertical: 8,
    borderRadius: 8,
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 20,
  },
});
