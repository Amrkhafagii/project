import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Clock, Filter, Bell, Users, ChartBar as BarChart3, ArrowDown, ArrowUp } from 'lucide-react-native';
import { useRestaurantOrders } from '@/services/restaurant/restaurantOrderService';
import { OrderCard } from './OrderCard';
import { OrderDetailModal } from './OrderDetailModal';

interface OrderManagementDashboardProps {
  restaurantId: string;
}

export function OrderManagementDashboard({ restaurantId }: OrderManagementDashboardProps) {
  const { 
    orders,
    loading, 
    refreshOrders, 
    acceptOrder, 
    rejectOrder, 
    updateOrderStatus
  } = useRestaurantOrders(restaurantId);

  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [filter, setFilter] = useState<string>('new');
  const [sortBy, setSortBy] = useState<'time' | 'value'>('time');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    await refreshOrders();
    setRefreshing(false);
  };

  const handleAcceptOrder = async (orderId: string) => {
    try {
      await acceptOrder(orderId);
      Alert.alert('Success', 'Order accepted');
    } catch (error) {
      Alert.alert('Error', 'Failed to accept order');
    }
  };

  const handleRejectOrder = async (orderId: string) => {
    Alert.alert(
      'Reject Order',
      'Are you sure you want to reject this order?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Reject',
          style: 'destructive',
          onPress: async () => {
            try {
              await rejectOrder(orderId);
              Alert.alert('Success', 'Order rejected');
            } catch (error) {
              Alert.alert('Error', 'Failed to reject order');
            }
          },
        },
      ]
    );
  };

  const handleUpdateStatus = async (orderId: string, status: string) => {
    try {
      await updateOrderStatus(orderId, status);
      Alert.alert('Success', `Order status updated to ${status}`);
    } catch (error) {
      Alert.alert('Error', 'Failed to update order status');
    }
  };

  const selectedOrder = selectedOrderId 
    ? orders.find(order => order.id === selectedOrderId)
    : null;

  // Filter orders based on selected filter
  const filteredOrders = orders.filter(order => {
    switch (filter) {
      case 'new':
        return order.status === 'pending' || order.status === 'restaurant_assigned';
      case 'preparing':
        return order.status === 'accepted' || order.status === 'preparing';
      case 'ready':
        return order.status === 'ready';
      case 'completed':
        return order.status === 'delivered' || order.status === 'cancelled';
      default:
        return true;
    }
  });

  // Sort orders
  const sortedOrders = [...filteredOrders].sort((a, b) => {
    if (sortBy === 'time') {
      const aTime = new Date(a.createdAt).getTime();
      const bTime = new Date(b.createdAt).getTime();
      return sortDirection === 'asc' ? aTime - bTime : bTime - aTime;
    } else {
      return sortDirection === 'asc' ? a.totalAmount - b.totalAmount : b.totalAmount - a.totalAmount;
    }
  });

  const getOrderMetrics = () => {
    const newOrders = orders.filter(o => o.status === 'pending' || o.status === 'restaurant_assigned').length;
    const preparingOrders = orders.filter(o => o.status === 'accepted' || o.status === 'preparing').length;
    const readyOrders = orders.filter(o => o.status === 'ready').length;
    const totalRevenue = orders
      .filter(o => o.status !== 'cancelled' && o.status !== 'no_restaurant_accepted')
      .reduce((sum, order) => sum + order.totalAmount, 0);
    
    return {
      newOrders,
      preparingOrders,
      readyOrders,
      totalRevenue: totalRevenue.toFixed(2),
    };
  };

  const metrics = getOrderMetrics();

  const toggleSort = (type: 'time' | 'value') => {
    if (sortBy === type) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(type);
      setSortDirection('asc');
    }
  };

  return (
    <View style={styles.container}>
      {/* Header with metrics */}
      <View style={styles.metricsContainer}>
        <View style={styles.metricCard}>
          <Bell size={20} color="#F59E0B" />
          <Text style={styles.metricValue}>{metrics.newOrders}</Text>
          <Text style={styles.metricLabel}>New</Text>
        </View>
        <View style={styles.metricCard}>
          <Clock size={20} color="#3B82F6" />
          <Text style={styles.metricValue}>{metrics.preparingOrders}</Text>
          <Text style={styles.metricLabel}>Preparing</Text>
        </View>
        <View style={styles.metricCard}>
          <Users size={20} color="#10B981" />
          <Text style={styles.metricValue}>{metrics.readyOrders}</Text>
          <Text style={styles.metricLabel}>Ready</Text>
        </View>
        <View style={styles.metricCard}>
          <BarChart3 size={20} color="#8B5CF6" />
          <Text style={styles.metricValue}>${metrics.totalRevenue}</Text>
          <Text style={styles.metricLabel}>Revenue</Text>
        </View>
      </View>

      {/* Filter tabs */}
      <View style={styles.filterContainer}>
        <ScrollableFilterTabs 
          activeFilter={filter}
          onFilterChange={setFilter}
          options={[
            { value: 'new', label: 'New' },
            { value: 'preparing', label: 'Preparing' },
            { value: 'ready', label: 'Ready' },
            { value: 'completed', label: 'Completed' },
            { value: 'all', label: 'All Orders' },
          ]}
        />

        <View style={styles.sortOptions}>
          <TouchableOpacity 
            style={styles.sortButton} 
            onPress={() => toggleSort('time')}
          >
            <Text style={[
              styles.sortButtonText,
              sortBy === 'time' && styles.sortButtonTextActive
            ]}>
              Time
            </Text>
            {sortBy === 'time' && (
              sortDirection === 'asc' ? <ArrowUp size={14} color="#10B981" /> : <ArrowDown size={14} color="#10B981" />
            )}
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.sortButton}
            onPress={() => toggleSort('value')}
          >
            <Text style={[
              styles.sortButtonText,
              sortBy === 'value' && styles.sortButtonTextActive
            ]}>
              Value
            </Text>
            {sortBy === 'value' && (
              sortDirection === 'asc' ? <ArrowUp size={14} color="#10B981" /> : <ArrowDown size={14} color="#10B981" />
            )}
          </TouchableOpacity>
        </View>
      </View>

      {/* Orders list */}
      <FlatList
        data={sortedOrders}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <OrderCard
            order={item}
            onPress={() => setSelectedOrderId(item.id)}
            onAccept={() => handleAcceptOrder(item.id)}
            onReject={() => handleRejectOrder(item.id)}
            onUpdateStatus={(status) => handleUpdateStatus(item.id, status)}
          />
        )}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        contentContainerStyle={styles.ordersList}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>
              No orders found for the selected filter
            </Text>
          </View>
        }
      />

      {/* Order detail modal */}
      {selectedOrder && (
        <OrderDetailModal
          order={selectedOrder}
          visible={!!selectedOrderId}
          onClose={() => setSelectedOrderId(null)}
          onAccept={() => {
            handleAcceptOrder(selectedOrder.id);
            setSelectedOrderId(null);
          }}
          onReject={() => {
            handleRejectOrder(selectedOrder.id);
            setSelectedOrderId(null);
          }}
          onUpdateStatus={(status) => {
            handleUpdateStatus(selectedOrder.id, status);
            setSelectedOrderId(null);
          }}
        />
      )}
    </View>
  );
}

// ScrollableFilterTabs component
interface ScrollableFilterTabsProps {
  activeFilter: string;
  onFilterChange: (filter: string) => void;
  options: Array<{ value: string; label: string }>;
}

function ScrollableFilterTabs({ activeFilter, onFilterChange, options }: ScrollableFilterTabsProps) {
  return (
    <View style={styles.filterTabs}>
      <FlatList
        data={options}
        horizontal
        showsHorizontalScrollIndicator={false}
        keyExtractor={item => item.value}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[
              styles.filterTab,
              activeFilter === item.value && styles.filterTabActive,
            ]}
            onPress={() => onFilterChange(item.value)}
          >
            <Text
              style={[
                styles.filterTabText,
                activeFilter === item.value && styles.filterTabTextActive,
              ]}
            >
              {item.label}
            </Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  metricsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  metricCard: {
    flex: 1,
    alignItems: 'center',
    padding: 8,
  },
  metricValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    marginTop: 4,
    marginBottom: 2,
  },
  metricLabel: {
    fontSize: 12,
    color: '#6B7280',
  },
  filterContainer: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    paddingBottom: 8,
  },
  filterTabs: {
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  filterTab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    borderRadius: 16,
    backgroundColor: '#F3F4F6',
  },
  filterTabActive: {
    backgroundColor: '#10B981',
  },
  filterTabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
  },
  filterTabTextActive: {
    color: '#FFFFFF',
  },
  sortOptions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  sortButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 16,
    padding: 4,
  },
  sortButtonText: {
    fontSize: 12,
    color: '#6B7280',
    marginRight: 4,
  },
  sortButtonTextActive: {
    color: '#10B981',
    fontWeight: '600',
  },
  ordersList: {
    padding: 16,
    paddingBottom: 80,
  },
  emptyContainer: {
    padding: 24,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
  },
});
