import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Switch,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Bell, ChartBar as BarChart3, Users, TrendingUp, Package, Clock, DollarSign, MapPin } from 'lucide-react-native';
import { useAuth } from '@/services/auth/authService';
import { useRestaurantOrders } from '@/services/restaurant/restaurantOrderService';
import { OrderCard } from '@/features/restaurant/components';
import { OrderStatusBadge } from '@/features/shared/components/OrderStatusBadge';

export default function RestaurantDashboardScreen() {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(true);
  const restaurantId = user?.id || 'restaurant_1';

  const { 
    orders, 
    loading, 
    acceptOrder, 
    rejectOrder, 
    updateOrderStatus 
  } = useRestaurantOrders(restaurantId);

  // Simplified metrics calculation
  const pendingOrders = orders.filter(o => o.status === 'pending' || o.status === 'restaurant_assigned').length;
  const preparingOrders = orders.filter(o => o.status === 'accepted' || o.status === 'preparing').length;
  const readyOrders = orders.filter(o => o.status === 'ready').length;
  
  const todaysOrders = orders.filter(o => {
    const orderDate = new Date(o.createdAt);
    const today = new Date();
    return orderDate.getDate() === today.getDate() &&
           orderDate.getMonth() === today.getMonth() &&
           orderDate.getFullYear() === today.getFullYear();
  });

  const todaysRevenue = todaysOrders.reduce((sum, order) => sum + order.totalAmount, 0);
  
  const recentOrders = [...orders]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 3);

  const handleToggleStatus = () => {
    setIsOpen(!isOpen);
    Alert.alert(
      isOpen ? 'Restaurant Closed' : 'Restaurant Open',
      isOpen 
        ? 'You are now offline. No new orders will be received.'
        : 'You are now online and will receive new orders.',
      [{ text: 'OK' }]
    );
  };

  const handleOrderAction = async (orderId: string, action: string) => {
    try {
      if (action === 'accept') {
        await acceptOrder(orderId);
      } else if (action === 'reject') {
        await rejectOrder(orderId);
      } else {
        await updateOrderStatus(orderId, action);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to process the order');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Welcome back!</Text>
            <Text style={styles.restaurantName}>{user?.user_metadata?.full_name || "Restaurant Manager"}</Text>
          </View>
          <View style={styles.statusToggle}>
            <Text style={[styles.statusText, { color: isOpen ? '#10B981' : '#6B7280' }]}>
              {isOpen ? 'Open' : 'Closed'}
            </Text>
            <Switch
              value={isOpen}
              onValueChange={handleToggleStatus}
              trackColor={{ false: '#D1D5DB', true: '#86EFAC' }}
              thumbColor={isOpen ? '#10B981' : '#FFFFFF'}
            />
          </View>
        </View>

        {/* Order Status Overview */}
        <View style={styles.overviewContainer}>
          <Text style={styles.sectionTitle}>Order Status</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <Bell size={24} color="#F59E0B" />
              <Text style={styles.statNumber}>{pendingOrders}</Text>
              <Text style={styles.statLabel}>New</Text>
            </View>
            <View style={styles.statCard}>
              <Clock size={24} color="#3B82F6" />
              <Text style={styles.statNumber}>{preparingOrders}</Text>
              <Text style={styles.statLabel}>Preparing</Text>
            </View>
            <View style={styles.statCard}>
              <Users size={24} color="#10B981" />
              <Text style={styles.statNumber}>{readyOrders}</Text>
              <Text style={styles.statLabel}>Ready</Text>
            </View>
            <View style={styles.statCard}>
              <BarChart3 size={24} color="#8B5CF6" />
              <Text style={styles.statNumber}>{todaysOrders.length}</Text>
              <Text style={styles.statLabel}>Today</Text>
            </View>
          </View>
        </View>

        {/* Today's Summary */}
        <View style={styles.summaryCard}>
          <Text style={styles.sectionTitle}>Today's Summary</Text>
          <View style={styles.summaryRow}>
            <View style={styles.summaryItem}>
              <View style={styles.summaryIconContainer}>
                <Package size={20} color="#FFFFFF" />
              </View>
              <View>
                <Text style={styles.summaryLabel}>Orders</Text>
                <Text style={styles.summaryValue}>{todaysOrders.length}</Text>
              </View>
            </View>
            <View style={styles.summaryItem}>
              <View style={[styles.summaryIconContainer, { backgroundColor: '#3B82F6' }]}>
                <DollarSign size={20} color="#FFFFFF" />
              </View>
              <View>
                <Text style={styles.summaryLabel}>Revenue</Text>
                <Text style={styles.summaryValue}>${todaysRevenue.toFixed(2)}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Recent Orders */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Orders</Text>
            <TouchableOpacity onPress={() => Alert.alert('Navigate to Orders tab')}>
              <Text style={styles.seeAllButton}>See All</Text>
            </TouchableOpacity>
          </View>

          {recentOrders.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No recent orders found</Text>
            </View>
          ) : (
            recentOrders.map(order => (
              <View key={order.id} style={styles.recentOrderCard}>
                <View style={styles.recentOrderHeader}>
                  <Text style={styles.orderNumber}>Order #{order.id.slice(-6)}</Text>
                  <OrderStatusBadge status={order.status as any} size="small" />
                </View>
                
                <View style={styles.recentOrderDetails}>
                  <View style={styles.recentOrderDetail}>
                    <Clock size={14} color="#6B7280" />
                    <Text style={styles.recentOrderDetailText}>
                      {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </Text>
                  </View>
                  <View style={styles.recentOrderDetail}>
                    <Users size={14} color="#6B7280" />
                    <Text style={styles.recentOrderDetailText}>{order.customer.name}</Text>
                  </View>
                  <View style={styles.recentOrderDetail}>
                    <DollarSign size={14} color="#10B981" />
                    <Text style={styles.recentOrderAmount}>${order.totalAmount.toFixed(2)}</Text>
                  </View>
                </View>
                
                {(order.status === 'pending' || order.status === 'restaurant_assigned') && (
                  <View style={styles.recentOrderActions}>
                    <TouchableOpacity 
                      style={styles.rejectButton}
                      onPress={() => handleOrderAction(order.id, 'reject')}
                    >
                      <Text style={styles.rejectButtonText}>Reject</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                      style={styles.acceptButton}
                      onPress={() => handleOrderAction(order.id, 'accept')}
                    >
                      <Text style={styles.acceptButtonText}>Accept</Text>
                    </TouchableOpacity>
                  </View>
                )}
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
  scrollView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 24,
  },
  greeting: {
    fontSize: 16,
    color: '#6B7280',
  },
  restaurantName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
  },
  statusToggle: {
    alignItems: 'center',
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  overviewContainer: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  statCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
  },
  summaryCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    marginHorizontal: 20,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  summaryItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  summaryIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#10B981',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  summaryLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 4,
  },
  summaryValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  seeAllButton: {
    fontSize: 14,
    fontWeight: '600',
    color: '#10B981',
  },
  emptyContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  emptyText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
  },
  recentOrderCard: {
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
  recentOrderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  orderNumber: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  recentOrderDetails: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 12,
  },
  recentOrderDetail: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
    marginBottom: 8,
  },
  recentOrderDetailText: {
    fontSize: 14,
    color: '#6B7280',
    marginLeft: 4,
  },
  recentOrderAmount: {
    fontSize: 14,
    fontWeight: '600',
    color: '#10B981',
    marginLeft: 4,
  },
  recentOrderActions: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    paddingTop: 12,
  },
  rejectButton: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
    marginRight: 8,
  },
  rejectButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#EF4444',
  },
  acceptButton: {
    flex: 1,
    backgroundColor: '#10B981',
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
    marginLeft: 8,
  },
  acceptButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
