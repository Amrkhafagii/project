import React from 'react';
import {
  View,
  Text,
  StyleSheet, 
  FlatList,
  TouchableOpacity,
  Alert,
  TextInput,
  RefreshControl
} from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '@/services/auth/authService';
import { useRestaurantOrders } from '@/services/restaurant/restaurantOrderService';
import { Clock, Filter, Search, ChevronDown, Bell, Circle, CheckCircle } from 'lucide-react-native';
import { Colors, Layout } from '@/constants';
import { OrderCard } from '@/features/restaurant/components/OrderCard';
import { OrderDetailModal } from '@/features/restaurant/components/OrderDetailModal';
import { useState, useEffect, useCallback } from 'react';

export default function RestaurantOrdersScreen() {
  const { user } = useAuth();
  const params = useLocalSearchParams();
  const initialFilter = params.filter as string || 'new';

  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<string>(initialFilter);
  const [sortBy, setSortBy] = useState<'time' | 'value'>('time');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const restaurantId = user?.id || 'restaurant_1';

  const { 
    orders,
    loading, 
    refreshOrders, 
    acceptOrder, 
    rejectOrder, 
    updateOrderStatus
  } = useRestaurantOrders(restaurantId);

  // Update the filter from URL params when they change
  useEffect(() => {
    if (params.filter) {
      setActiveFilter(params.filter as string);
    }
  }, [params.filter]);

  // Filter orders based on selected filter
  const filteredOrders = orders.filter(order => {
    // First apply the search filter
    const matchesSearch = searchQuery === '' || 
                          order.customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          order.id.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (!matchesSearch) return false;
    
    // Then apply the tab filter
    switch (activeFilter) {
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

  const toggleSort = (type: 'time' | 'value') => {
    if (sortBy === type) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(type);
      setSortDirection('desc');
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await refreshOrders();
    setRefreshing(false);
  };

  const handleAcceptOrder = async (orderId: string) => {
    try {
      await acceptOrder(orderId);
      Alert.alert('Success', 'Order accepted');
      refreshOrders();
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
              refreshOrders();
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
      refreshOrders();
    } catch (error) {
      Alert.alert('Error', 'Failed to update order status');
    }
  };

  const selectedOrder = selectedOrderId 
    ? orders.find(order => order.id === selectedOrderId)
    : null;

  const renderEmptyList = () => (
    <View style={styles.emptyStateContainer}>
      <Bell size={48} color={Colors.gray[300]} />
      <Text style={styles.emptyStateTitle}>No orders found</Text>
      <Text style={styles.emptyStateText}>
        {searchQuery ? 'Try adjusting your search filters' : 'New orders will appear here'}
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header with search and filter */}
      <View style={styles.searchFilterContainer}>
        <View style={styles.searchBarContainer}>
          <Search size={20} color={Colors.textTertiary} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search orders..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor={Colors.textTertiary}
          />
        </View>
        <TouchableOpacity
          style={styles.filterButton}
          onPress={() => setShowFilters(!showFilters)}
        >
          <Filter size={20} color={Colors.text} />
          {showFilters && <View style={styles.filterIndicator} />}
        </TouchableOpacity>
      </View>

      {/* Filter tabs */}
      <View style={styles.tabsContainer}>
        {[
          { id: 'new', label: 'New', count: orders.filter(o => o.status === 'pending' || o.status === 'restaurant_assigned').length },
          { id: 'preparing', label: 'Preparing', count: orders.filter(o => o.status === 'accepted' || o.status === 'preparing').length },
          { id: 'ready', label: 'Ready', count: orders.filter(o => o.status === 'ready').length },
          { id: 'completed', label: 'Completed', count: orders.filter(o => o.status === 'delivered' || o.status === 'cancelled').length },
          { id: 'all', label: 'All', count: orders.length },
        ].map(tab => (
          <TouchableOpacity
            key={tab.id}
            style={[
              styles.tab,
              activeFilter === tab.id && styles.activeTab
            ]}
            onPress={() => setActiveFilter(tab.id)}
          >
            <Text style={[
              styles.tabLabel,
              activeFilter === tab.id && styles.activeTabLabel
            ]}>
              {tab.label}
            </Text>
            {tab.count > 0 && (
              <View style={[
                styles.tabBadge,
                activeFilter === tab.id && styles.activeTabBadge
              ]}>
                <Text style={[
                  styles.tabBadgeText,
                  activeFilter === tab.id && styles.activeTabBadgeText
                ]}>
                  {tab.count}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        ))}
      </View>

      {/* Sort options (conditional) */}
      {showFilters && (
        <View style={styles.sortOptionsContainer}>
          <Text style={styles.sortOptionsLabel}>Sort by:</Text>
          <View style={styles.sortButtonsContainer}>
            <TouchableOpacity
              style={[styles.sortButton, sortBy === 'time' && styles.activeSortButton]}
              onPress={() => toggleSort('time')}
            >
              <Text style={[styles.sortButtonText, sortBy === 'time' && styles.activeSortButtonText]}>
                Time {sortBy === 'time' && (sortDirection === 'asc' ? '(oldest)' : '(newest)')}
              </Text>
              {sortBy === 'time' && (
                <ChevronDown
                  size={16}
                  color={Colors.primary}
                  style={{ transform: [{ rotate: sortDirection === 'asc' ? '0deg' : '180deg' }] }}
                />
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.sortButton, sortBy === 'value' && styles.activeSortButton]}
              onPress={() => toggleSort('value')}
            >
              <Text style={[styles.sortButtonText, sortBy === 'value' && styles.activeSortButtonText]}>
                Value {sortBy === 'value' && (sortDirection === 'asc' ? '(lowest)' : '(highest)')}
              </Text>
              {sortBy === 'value' && (
                <ChevronDown
                  size={16}
                  color={Colors.primary}
                  style={{ transform: [{ rotate: sortDirection === 'asc' ? '0deg' : '180deg' }] }}
                />
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Orders list */}
      <FlatList
        data={sortedOrders}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        renderItem={({ item }) => (
          <OrderCard
            order={item}
            onPress={() => setSelectedOrderId(item.id)}
            onAccept={() => handleAcceptOrder(item.id)}
            onReject={() => handleRejectOrder(item.id)}
            onUpdateStatus={(status) => handleUpdateStatus(item.id, status)}
          />
        )}
        ListEmptyComponent={renderEmptyList}
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
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  searchFilterContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    gap: 12,
    alignItems: 'center',
  },
  searchBarContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.gray[100],
    borderRadius: Layout.borderRadius.md,
    paddingHorizontal: 12,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 40,
    fontSize: Layout.fontSize.md,
    color: Colors.text,
  },
  filterButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: Layout.borderRadius.md,
    backgroundColor: Colors.gray[100],
    position: 'relative',
  },
  filterIndicator: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.primary,
  },
  tabsContainer: {
    flexDirection: 'row',
    paddingVertical: 4,
    paddingHorizontal: 16,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  tab: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
    borderRadius: Layout.borderRadius.full,
  },
  activeTab: {
    backgroundColor: `${Colors.primary}15`,
  },
  tabLabel: {
    fontSize: Layout.fontSize.sm,
    fontWeight: '500',
    color: Colors.textSecondary,
  },
  activeTabLabel: {
    color: Colors.primary,
  },
  tabBadge: {
    backgroundColor: Colors.gray[200],
    borderRadius: 10,
    marginLeft: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
    minWidth: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  activeTabBadge: {
    backgroundColor: Colors.primary,
  },
  tabBadgeText: {
    fontSize: 10,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  activeTabBadgeText: {
    color: Colors.white,
  },
  sortOptionsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: Colors.gray[50],
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  sortOptionsLabel: {
    fontSize: Layout.fontSize.sm,
    color: Colors.textSecondary,
    marginRight: 12,
  },
  sortButtonsContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  sortButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: Layout.borderRadius.sm,
    borderWidth: 1,
    borderColor: Colors.gray[200],
    backgroundColor: Colors.white,
  },
  activeSortButton: {
    borderColor: Colors.primary,
    backgroundColor: `${Colors.primary}10`,
  },
  sortButtonText: {
    fontSize: Layout.fontSize.sm,
    color: Colors.textSecondary,
    marginRight: 4,
  },
  activeSortButtonText: {
    color: Colors.primary,
    fontWeight: '500',
  },
  listContainer: {
    padding: 16,
    paddingBottom: 80,
  },
  emptyStateContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
    marginTop: 40,
  },
  emptyStateTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: Colors.text,
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
    maxWidth: 250,
  }
});
