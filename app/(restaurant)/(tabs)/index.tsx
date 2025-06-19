import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Switch,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Bell, ChartBar as BarChart3, Users, TrendingUp, Package, Clock, DollarSign, MapPin, ChevronRight, CircleAlert as AlertCircle, Tag, CalendarRange } from 'lucide-react-native';
import { useAuth } from '@/services/auth/authService';
import { useRestaurantOrders } from '@/services/restaurant/restaurantOrderService';
import { OrderStatusBadge } from '@/features/shared/components/OrderStatusBadge';
import { Card } from '@/app/_components/common/Card';

const { width } = Dimensions.get('window');

export default function RestaurantDashboardScreen() {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const restaurantId = user?.id || 'restaurant_1';
  const [showAlerts, setShowAlerts] = useState(true);

  const { 
    orders, 
    loading, 
    acceptOrder, 
    rejectOrder, 
    updateOrderStatus 
  } = useRestaurantOrders(restaurantId);

  // Statistics calculation
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

  // Get total orders for the week
  const todaysOrders = orders.filter(o => {
    const orderDate = new Date(o.createdAt);
    const today = new Date();
    return orderDate.getDate() === today.getDate() &&
           orderDate.getMonth() === today.getMonth() &&
           orderDate.getFullYear() === today.getFullYear();
  });
  const weeklyOrders = orders.filter(o => {
    const orderDate = new Date(o.createdAt);
    const today = new Date();
    const lastWeek = new Date(today);
    lastWeek.setDate(today.getDate() - 7);
    return orderDate >= lastWeek;
  });

  const todaysRevenue = todaysOrders.reduce((sum, order) => sum + order.totalAmount, 0);
  const weeklyRevenue = weeklyOrders.reduce((sum, order) => sum + order.totalAmount, 0);
  
  // Alerts
  const alerts = [
    {
      id: 'alert1',
      title: 'Low inventory alert',
      message: 'Salmon and quinoa are running low. Consider restocking soon.',
      type: 'warning',
      timestamp: '30 minutes ago'
    },
    {
      id: 'alert2',
      title: 'New customer reviews',
      message: 'You have 3 new customer reviews with an average rating of 4.8',
      type: 'info',
      timestamp: '1 hour ago'
    }
  ];
  
  const recentOrders = [...orders]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 3);
    
  // Popular menu items
  const popularItems = [
    { name: 'Grilled Salmon Power Bowl', orders: 42, revenue: 797.58 },
    { name: 'Lean Chicken Mediterranean', orders: 38, revenue: 627.00 },
    { name: 'Protein-Packed Quinoa Bowl', orders: 25, revenue: 374.75 }
  ];
  
  // Promotions
  const activePromotions = [
    { name: 'Summer Special', type: 'discount', value: '15% OFF', ends: '08/31/2025', usage: 78 },
    { name: 'Protein Pack', type: 'bundle', value: 'Save $5', ends: '07/15/2025', usage: 65 }
  ];

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
  
  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await refreshOrders();
    } finally {
      setRefreshing(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
        style={styles.scrollView} 
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        showsVerticalScrollIndicator={false}
      >
        {/* System Alerts */}
        {showAlerts && alerts.length > 0 && (
          <View style={styles.alertsContainer}>
            <View style={styles.alertsHeader}>
              <View style={styles.sectionTitleContainer}>
                <AlertCircle size={20} color={Colors.warning} />
                <Text style={styles.sectionTitle}>Alerts</Text>
              </View>
              <TouchableOpacity onPress={() => setShowAlerts(false)}>
                <Text style={styles.dismissText}>Dismiss All</Text>
              </TouchableOpacity>
            </View>
            
            {alerts.map((alert) => (
              <View key={alert.id} style={styles.alertCard}>
                <View style={styles.alertHeader}>
                  <Text style={styles.alertTitle}>{alert.title}</Text>
                  <Text style={styles.alertTimestamp}>{alert.timestamp}</Text>
                </View>
                <Text style={styles.alertMessage}>{alert.message}</Text>
              </View>
            ))}
          </View>
        )}
      
        {/* Business Summary */}
        <Card style={styles.businessSummary}>
          <View style={styles.summaryHeader}>
            <Text style={styles.summaryTitle}>Today's Business</Text>
            <TouchableOpacity 
              style={styles.summaryAction}
              onPress={() => router.push('/(restaurant)/(tabs)/analytics')}
            >
              <Text style={styles.summaryActionText}>Full Report</Text>
              <ChevronRight size={16} color={Colors.primary} />
            </TouchableOpacity>
          </View>

          <View style={styles.summaryCards}>
            <View style={styles.summaryCard}>
              <View style={styles.summaryIconContainer}>
                <Package size={20} color={Colors.white} />
              </View>
              <View>
                <Text style={styles.summaryValue}>{todaysOrders.length}</Text>
                <Text style={styles.summaryLabel}>Orders</Text>
              </View>
            </View>
            
            <View style={styles.summaryCard}>
              <View style={[styles.summaryIconContainer, { backgroundColor: Colors.secondary }]}>
                <DollarSign size={20} color={Colors.white} />
              </View>
              <View>
                <Text style={styles.summaryValue}>${todaysRevenue.toFixed(0)}</Text>
                <Text style={styles.summaryLabel}>Revenue</Text>
              </View>
            </View>
          </View>

          <View style={styles.weeklyStatsContainer}>
            <View style={styles.weeklyStatCard}>
              <Text style={styles.weeklyStatLabel}>Weekly Orders</Text>
              <Text style={styles.weeklyStatValue}>{weeklyOrders.length}</Text>
              <View style={styles.weeklyStatTrendContainer}>
                <TrendingUp size={14} color={Colors.success} />
                <Text style={styles.weeklyStatTrend}>+12%</Text>
              </View>
            </View>

            <View style={styles.weeklyStatCard}>
              <Text style={styles.weeklyStatLabel}>Weekly Revenue</Text>
              <Text style={styles.weeklyStatValue}>${weeklyRevenue.toFixed(0)}</Text>
              <View style={styles.weeklyStatTrendContainer}>
                <TrendingUp size={14} color={Colors.success} />
                <Text style={styles.weeklyStatTrend}>+8%</Text>
              </View>
            </View>
          </View>
        </Card>

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
        <Card style={styles.ordersOverviewContainer}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Order Status</Text>
            <TouchableOpacity 
              style={styles.viewAllButton}
              onPress={() => router.push('/(restaurant)/(tabs)/orders')}
            >
              <Text style={styles.viewAllText}>View All</Text>
              <ChevronRight size={16} color={Colors.primary} />
            </TouchableOpacity>
          </View>
          <View style={styles.orderStatusCards}>
            <TouchableOpacity 
              style={styles.orderStatusCard}
              onPress={() => router.push({
                pathname: '/(restaurant)/(tabs)/orders',
                params: { filter: 'new' }
              })}
            >
              <Bell size={20} color={Colors.warning} />
              <Text style={styles.orderStatusNumber}>{pendingOrders}</Text>
              <Text style={styles.orderStatusLabel}>New</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.orderStatusCard}
              onPress={() => router.push({
                pathname: '/(restaurant)/(tabs)/orders',
                params: { filter: 'preparing' }
              })}
            >
              <Clock size={20} color={Colors.info} />
              <Text style={styles.orderStatusNumber}>{preparingOrders}</Text>
              <Text style={styles.orderStatusLabel}>Preparing</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.orderStatusCard}
              onPress={() => router.push({
                pathname: '/(restaurant)/(tabs)/orders',
                params: { filter: 'ready' }
              })}
            >
              <Users size={20} color={Colors.success} />
              <Text style={styles.orderStatusNumber}>{readyOrders}</Text>
              <Text style={styles.orderStatusLabel}>Ready</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.orderStatusCard}
              onPress={() => router.push({
                pathname: '/(restaurant)/(tabs)/orders',
                params: { filter: 'all' }
              })}
            >
              <BarChart3 size={20} color={Colors.secondary} />
              <Text style={styles.orderStatusNumber}>{todaysOrders.length}</Text>
              <Text style={styles.orderStatusLabel}>Today</Text>
            </TouchableOpacity>
          </View>
        </Card>

        {/* Popular Items & Analytics Preview */}
        <View style={styles.splitContainer}>
          <Card style={styles.splitCard}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>Popular Items</Text>
              <TouchableOpacity 
                style={styles.viewAllButton}
                onPress={() => router.push('/(restaurant)/(tabs)/analytics')}
              >
                <Text style={styles.viewAllText}>More</Text>
                <ChevronRight size={16} color={Colors.primary} />
              </TouchableOpacity>
            </View>
            
            {popularItems.map((item, index) => (
              <View key={index} style={styles.popularItemRow}>
                <Text style={styles.popularItemName} numberOfLines={1}>{item.name}</Text>
                <View style={styles.popularItemStats}>
                  <Text style={styles.popularItemOrders}>{item.orders}</Text>
                  <Text style={styles.popularItemRevenue}>${item.revenue}</Text>
                </View>
              </View>
            ))}
          </Card>
          
          <Card style={styles.splitCard}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>Promotions</Text>
              <TouchableOpacity 
                style={styles.viewAllButton}
                onPress={() => router.push('/(restaurant)/(tabs)/promotions')}
              >
                <Text style={styles.viewAllText}>Manage</Text>
                <ChevronRight size={16} color={Colors.primary} />
              </TouchableOpacity>
            </View>
            
            {activePromotions.map((promo, index) => (
              <View key={index} style={styles.promotionRow}>
                <View style={styles.promotionInfo}>
                  <Text style={styles.promotionName} numberOfLines={1}>{promo.name}</Text>
                  <View style={styles.promotionMeta}>
                    <Text style={styles.promotionValue}>{promo.value}</Text>
                    <Text style={styles.promotionDate}>Ends {promo.ends}</Text>
                  </View>
                </View>
                <View style={styles.promotionUsage}>
                  <Tag size={14} color={Colors.primary} />
                  <Text style={styles.promotionUsageText}>{promo.usage} uses</Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Recent Orders */}
        <Card style={styles.recentOrdersContainer}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Recent Orders</Text>
            <TouchableOpacity 
              style={styles.viewAllButton}
              onPress={() => router.push('/(restaurant)/(tabs)/orders')}
            >
              <Text style={styles.viewAllText}>View All</Text>
              <ChevronRight size={16} color={Colors.primary} />
            </TouchableOpacity>
          </View>

          {recentOrders.length === 0 ? (
            <View style={styles.emptyState}>
              <ClipboardList size={48} color={Colors.gray[300]} />
              <Text style={styles.emptyStateText}>No recent orders found</Text>
            </View> 
          ) : (
            recentOrders.map(order => (
              <View key={order.id} style={styles.recentOrderCard}>
                <View style={styles.recentOrderHeader}>
                  <Text style={styles.orderNumber}>Order #{order.id.slice(-6)}</Text>
                  <OrderStatusBadge status={order.status as any} size="small" />
                </View>
                
                <View style={styles.recentOrderDetails}>
                  <View style={styles.orderDetailItem}>
                    <Clock size={14} color={Colors.textTertiary} />
                    <Text style={styles.orderDetailText}>
                      {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </Text>
                  </View>
                  <View style={styles.orderDetailItem}>
                    <Users size={14} color={Colors.textTertiary} />
                    <Text style={styles.orderDetailText}>{order.customer.name}</Text>
                  </View>
                  <View style={styles.orderDetailItem}>
                    <DollarSign size={14} color={Colors.primary} />
                    <Text style={styles.recentOrderAmount}>${order.totalAmount.toFixed(2)}</Text>
                  </View>
                </View>
                
                {(order.status === 'pending' || order.status === 'restaurant_assigned') && (
                  <View style={styles.recentOrderActions}>
                    <TouchableOpacity 
                      style={styles.actionButtonReject}
                      onPress={() => {
                        rejectOrder(order.id);
                        refreshOrders();
                      }}
                    >
                      <Text style={styles.rejectButtonText}>Reject</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                      style={styles.actionButtonAccept}
                      onPress={() => {
                        acceptOrder(order.id);
                        refreshOrders();
                      }}
                    >
                      <Text style={styles.acceptButtonText}>Accept</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            ))
          )}
        </Card>
        
        {/* Upcoming Reservations (Preview) */}
        <Card style={styles.reservationsContainer}>
          <View style={styles.cardHeader}>
            <View style={styles.sectionTitleContainer}>
              <CalendarRange size={20} color={Colors.text} />
              <Text style={styles.cardTitle}>Upcoming Reservations</Text>
            </View>
            <TouchableOpacity style={styles.viewAllButton}>
              <Text style={styles.viewAllText}>View All</Text>
              <ChevronRight size={16} color={Colors.primary} />
            </TouchableOpacity>
          </View>
          
          <View style={styles.emptyState}>
            <CalendarRange size={48} color={Colors.gray[300]} />
            <Text style={styles.emptyStateText}>No upcoming reservations</Text>
          </View>
        </Card>
        
        {/* Bottom spacing */}
        <View style={{ height: 20 }} />
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
  alertsContainer: {
    marginHorizontal: 16,
    marginVertical: 12,
  },
  alertsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  sectionTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  dismissText: {
    fontSize: 14,
    color: Colors.primary,
    fontWeight: '500',
  },
  alertCard: {
    backgroundColor: '#FFF9EB',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    borderLeftWidth: 4,
    borderLeftColor: Colors.warning,
  },
  alertHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  alertTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
  },
  alertTimestamp: {
    fontSize: 12,
    color: Colors.textTertiary,
  },
  alertMessage: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  businessSummary: {
    marginHorizontal: 16,
    marginVertical: 12,
    padding: 16,
  },
  summaryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
  },
  summaryAction: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  summaryActionText: {
    fontSize: 14,
    color: Colors.primary,
    marginRight: 4,
  },
  summaryCards: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  summaryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 16,
    flex: 1,
    marginHorizontal: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
    elevation: 1,
  },
  summaryIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  summaryValue: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text,
  },
  summaryLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  weeklyStatsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  weeklyStatCard: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 12,
    margin: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
    elevation: 1,
  },
  weeklyStatLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  weeklyStatValue: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 4,
  },
  weeklyStatTrendContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  weeklyStatTrend: {
    fontSize: 12,
    color: Colors.success,
    marginLeft: 4,
    fontWeight: '500',
  },
  ordersOverviewContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    marginBottom: 24,
    marginHorizontal: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  viewAllText: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.primary,
    marginRight: 2,
  },
  orderStatusCards: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  orderStatusCard: {
    flex: 1, 
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
  },
  orderStatusNumber: {
    fontSize: 22,
    fontWeight: '700',
    color: '#111827',
    marginVertical: 6,
  },
  orderStatusLabel: {
    fontSize: 12,
    color: '#6B7280',
  },
  splitContainer: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginBottom: 24,
    gap: 12,
  },
  splitCard: {
    flex: 1,
    padding: 16,
  },
  popularItemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  popularItemName: {
    fontSize: 14,
    color: Colors.text,
    flex: 1,
    marginRight: 8,
  },
  popularItemStats: {
    alignItems: 'flex-end',
  },
  popularItemOrders: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
  },
  popularItemRevenue: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  promotionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  promotionInfo: {
    flex: 1,
    marginRight: 8,
  },
  promotionName: {
    fontSize: 14,
    color: Colors.text,
    marginBottom: 2,
  },
  promotionMeta: {
    flexDirection: 'row',
    gap: 8,
  },
  promotionValue: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.success,
  },
  promotionDate: {
    fontSize: 12,
    color: Colors.textTertiary,
  },
  promotionUsage: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  promotionUsageText: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  recentOrdersContainer: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    marginHorizontal: 16,
    marginBottom: 24,
  },
  reservationsContainer: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    marginHorizontal: 16,
    marginBottom: 24,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  emptyStateText: {
    marginTop: 8,
    fontSize: 14,
    color: Colors.textTertiary,
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
  orderDetailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
    marginBottom: 8,
  },
  orderDetailText: {
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
    marginTop: 8,
    gap: 8,
  },
  actionButtonReject: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  rejectButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#EF4444',
  },
  actionButtonAccept: {
    flex: 1,
    backgroundColor: '#10B981',
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
  },
  acceptButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  }
});
