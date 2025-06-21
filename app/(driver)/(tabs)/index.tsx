import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Switch,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '@/contexts/AuthContext'
import { 
  MapPin, 
  Clock, 
  DollarSign, 
  Package,
  Navigation,
  Phone,
  MessageCircle
} from 'lucide-react-native';
import { getCurrentLocation } from '@/services/location/locationService';

interface ActiveOrder {
  id: string;
  customerName: string;
  customerPhone: string;
  pickupAddress: string;
  deliveryAddress: string;
  items: number;
  total: number;
  estimatedTime: number;
  status: 'assigned' | 'picked_up' | 'on_the_way';
}

export default function DriverDashboard() {
  const { user } = useAuth();
  const [isOnline, setIsOnline] = useState(false);
  const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [activeOrder, setActiveOrder] = useState<ActiveOrder | null>({
    id: '1',
    customerName: 'Sarah Johnson',
    customerPhone: '+1 (555) 123-4567',
    pickupAddress: 'Green Bowl Kitchen, 123 Health St',
    deliveryAddress: '456 Wellness Ave, Apt 2B',
    items: 3,
    total: 42.50,
    estimatedTime: 25,
    status: 'assigned',
  });

  const [todayStats] = useState({
    deliveries: 8,
    earnings: 156.75,
    hoursOnline: 6.5,
    rating: 4.9,
  });

  useEffect(() => {
    loadLocation();
  }, []);

  const loadLocation = async () => {
    try {
      const currentLocation = await getCurrentLocation();
      setLocation(currentLocation);
    } catch (error) {
      Alert.alert('Location Error', 'Unable to get your location');
    }
  };

  const toggleOnlineStatus = () => {
    setIsOnline(!isOnline);
    if (!isOnline) {
      Alert.alert('You\'re Online!', 'You will now receive delivery requests');
    }
  };

  const handleAcceptOrder = () => {
    if (activeOrder) {
      setActiveOrder({ ...activeOrder, status: 'picked_up' });
      Alert.alert('Order Accepted', 'Navigate to pickup location');
    }
  };

  const handleCompletePickup = () => {
    if (activeOrder) {
      setActiveOrder({ ...activeOrder, status: 'on_the_way' });
      Alert.alert('Order Picked Up', 'Navigate to delivery location');
    }
  };

  const handleCompleteDelivery = () => {
    Alert.alert('Delivery Complete', 'Great job! Payment has been processed.');
    setActiveOrder(null);
  };

  const getStatusAction = () => {
    if (!activeOrder) return null;

    switch (activeOrder.status) {
      case 'assigned':
        return (
          <TouchableOpacity style={styles.actionButton} onPress={handleAcceptOrder}>
            <Text style={styles.actionButtonText}>Accept Order</Text>
          </TouchableOpacity>
        );
      case 'picked_up':
        return (
          <TouchableOpacity style={styles.actionButton} onPress={handleCompletePickup}>
            <Text style={styles.actionButtonText}>Mark as Picked Up</Text>
          </TouchableOpacity>
        );
      case 'on_the_way':
        return (
          <TouchableOpacity style={styles.actionButton} onPress={handleCompleteDelivery}>
            <Text style={styles.actionButtonText}>Complete Delivery</Text>
          </TouchableOpacity>
        );
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>
              Good {new Date().getHours() < 12 ? 'morning' : 'afternoon'}!
            </Text>
            <Text style={styles.driverName}>
              {user?.user_metadata?.full_name || 'Driver'}
            </Text>
          </View>
          <View style={styles.onlineToggle}>
            <Text style={[styles.onlineText, { color: isOnline ? '#10B981' : '#6B7280' }]}>
              {isOnline ? 'Online' : 'Offline'}
            </Text>
            <Switch
              value={isOnline}
              onValueChange={toggleOnlineStatus}
              trackColor={{ false: '#D1D5DB', true: '#86EFAC' }}
              thumbColor={isOnline ? '#10B981' : '#FFFFFF'}
            />
          </View>
        </View>

        {/* Today's Stats */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Package size={24} color="#10B981" />
            <Text style={styles.statNumber}>{todayStats.deliveries}</Text>
            <Text style={styles.statLabel}>Deliveries</Text>
          </View>
          <View style={styles.statCard}>
            <DollarSign size={24} color="#F59E0B" />
            <Text style={styles.statNumber}>${todayStats.earnings}</Text>
            <Text style={styles.statLabel}>Earnings</Text>
          </View>
          <View style={styles.statCard}>
            <Clock size={24} color="#3B82F6" />
            <Text style={styles.statNumber}>{todayStats.hoursOnline}h</Text>
            <Text style={styles.statLabel}>Online</Text>
          </View>
        </View>

        {/* Active Order */}
        {activeOrder && (
          <View style={styles.activeOrderCard}>
            <View style={styles.orderHeader}>
              <Text style={styles.orderTitle}>Active Delivery</Text>
              <View style={styles.statusBadge}>
                <Text style={styles.statusText}>
                  {activeOrder.status.replace('_', ' ').toUpperCase()}
                </Text>
              </View>
            </View>

            <View style={styles.customerInfo}>
              <Text style={styles.customerName}>{activeOrder.customerName}</Text>
              <View style={styles.customerActions}>
                <TouchableOpacity style={styles.contactButton}>
                  <Phone size={16} color="#FFFFFF" />
                </TouchableOpacity>
                <TouchableOpacity style={styles.contactButton}>
                  <MessageCircle size={16} color="#FFFFFF" />
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.addressSection}>
              <View style={styles.addressItem}>
                <MapPin size={16} color="#EF4444" />
                <View style={styles.addressText}>
                  <Text style={styles.addressLabel}>Pickup</Text>
                  <Text style={styles.addressValue}>{activeOrder.pickupAddress}</Text>
                </View>
                <TouchableOpacity style={styles.navigateButton}>
                  <Navigation size={16} color="#10B981" />
                </TouchableOpacity>
              </View>

              <View style={styles.addressItem}>
                <MapPin size={16} color="#10B981" />
                <View style={styles.addressText}>
                  <Text style={styles.addressLabel}>Delivery</Text>
                  <Text style={styles.addressValue}>{activeOrder.deliveryAddress}</Text>
                </View>
                <TouchableOpacity style={styles.navigateButton}>
                  <Navigation size={16} color="#10B981" />
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.orderDetails}>
              <Text style={styles.orderDetailText}>
                {activeOrder.items} items • ${activeOrder.total.toFixed(2)} • ~{activeOrder.estimatedTime} min
              </Text>
            </View>

            {getStatusAction()}
          </View>
        )}

        {/* No Active Orders */}
        {!activeOrder && isOnline && (
          <View style={styles.noOrdersCard}>
            <MapPin size={48} color="#D1D5DB" />
            <Text style={styles.noOrdersTitle}>Looking for deliveries...</Text>
            <Text style={styles.noOrdersSubtitle}>
              You'll receive notifications when orders are available in your area
            </Text>
          </View>
        )}

        {!isOnline && (
          <View style={styles.offlineCard}>
            <Clock size={48} color="#D1D5DB" />
            <Text style={styles.offlineTitle}>You're Offline</Text>
            <Text style={styles.offlineSubtitle}>
              Turn on availability to start receiving delivery requests
            </Text>
          </View>
        )}
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
    paddingBottom: 24,
  },
  greeting: {
    fontSize: 16,
    color: '#6B7280',
  },
  driverName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
  },
  onlineToggle: {
    alignItems: 'center',
  },
  onlineText: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 24,
    justifyContent: 'space-between',
  },
  statCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statNumber: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  activeOrderCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    marginHorizontal: 20,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  orderTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  statusBadge: {
    backgroundColor: '#10B981',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  customerInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  customerName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  customerActions: {
    flexDirection: 'row',
    gap: 8,
  },
  contactButton: {
    backgroundColor: '#10B981',
    borderRadius: 20,
    padding: 8,
  },
  addressSection: {
    marginBottom: 16,
  },
  addressItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  addressText: {
    flex: 1,
    marginLeft: 12,
  },
  addressLabel: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '600',
  },
  addressValue: {
    fontSize: 14,
    color: '#111827',
    marginTop: 2,
  },
  navigateButton: {
    padding: 8,
  },
  orderDetails: {
    marginBottom: 16,
  },
  orderDetailText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
  },
  actionButton: {
    backgroundColor: '#10B981',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  noOrdersCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 40,
    marginHorizontal: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  noOrdersTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#111827',
    marginTop: 16,
    marginBottom: 8,
  },
  noOrdersSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 20,
  },
  offlineCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 40,
    marginHorizontal: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  offlineTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#111827',
    marginTop: 16,
    marginBottom: 8,
  },
  offlineSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 20,
  },
});
