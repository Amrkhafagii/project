import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Platform,
  Dimensions,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { useLocalSearchParams, useRouter, Link } from 'expo-router';
import { ArrowLeft, Phone, MessageCircle, Clock, CircleCheck as CheckCircle, Package, Truck, MapPin, Chrome as Home } from 'lucide-react-native';
import { Colors, Layout } from '@/constants';
import { getRealTimeManager } from '@/services/realtime/realTimeManager';
import  Button  from '@/app/_components/common/Button';
import { Card } from '@/app/_components/common/Card';

const { width } = Dimensions.get('window');

const ORDER_STATUSES = [
  { id: 'confirmed', label: 'Confirmed', icon: CheckCircle },
  { id: 'preparing', label: 'Preparing', icon: Package },
  { id: 'ready', label: 'Ready', icon: Package },
  { id: 'picked_up', label: 'Picked Up', icon: Truck },
  { id: 'on_the_way', label: 'On the Way', icon: Truck },
  { id: 'delivered', label: 'Delivered', icon: Home },
];

export default function OrderTrackingScreen() {
  const params = useLocalSearchParams();
  const router = useRouter();
  const orderId = params.orderId as string || 'order_1'; // Fallback for testing
  
  const [order, setOrder] = useState({
    id: orderId,
    restaurant: {
      id: 'rest_1',
      name: 'Green Bowl Kitchen',
      phone: '(555) 123-4567',
      address: '123 Health St.',
      location: {
        latitude: 40.7128,
        longitude: -74.0060,
      }
    },
    customer: {
      id: 'cust_1',
      name: 'John Doe',
      address: '456 Fitness Ave, Apt 4B',
      location: {
        latitude: 40.7135,
        longitude: -74.0080,
      }
    },
    items: [
      { name: 'Grilled Salmon Power Bowl', quantity: 2, price: 18.99 },
      { name: 'Green Smoothie', quantity: 1, price: 7.99 }
    ],
    total: 45.97,
    status: 'confirmed',
    createdAt: new Date(Date.now() - 2000000).toISOString(),
    estimatedDeliveryTime: new Date(Date.now() + 1800000).toISOString(), // 30 min from now
    driver: null,
  });
  
  // State for driver location and ETA
  const [driverLocation, setDriverLocation] = useState(null);
  const [eta, setEta] = useState<Date | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  
  // Animation value for pulsing
  const pulseAnim = useRef(new Animated.Value(0.8)).current;
  
  // Map ref to control camera
  const mapRef = useRef(null);
  
  // Start pulsing animation
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.2,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 0.8,
          duration: 1000,
          useNativeDriver: true,
        })
      ])
    ).start();
  }, [pulseAnim]);

  // Connect to real-time updates
  useEffect(() => {
    const realTimeManager = getRealTimeManager();
    let orderSubscription: (() => void) | null = null;
    let driverLocationSubscription: (() => void) | null = null;
    
    if (realTimeManager) {
      // Subscribe to order updates
      orderSubscription = realTimeManager.subscribe(`order_${orderId}`, (update) => {
        setOrder(prev => ({ ...prev, status: update.status }));
        
        // If driver was assigned in this update
        if (update.driverId && !order.driver) {
          setOrder(prev => ({
            ...prev,
            driver: {
              id: update.driverId,
              name: update.driverName || 'Your Driver',
              phone: update.driverPhone || '(555) 555-5555',
              photo: update.driverPhoto,
              vehicle: update.vehicle || { type: 'car', color: 'blue', model: 'Sedan' },
            }
          }));
        }
      });
      
      // If the order status is beyond confirmed, check for driver updates
      if (['picked_up', 'on_the_way'].includes(order.status) && order.driver) {
        // Subscribe to driver location updates
        driverLocationSubscription = realTimeManager.subscribe(
          `driver_location_${order.driver.id}`, 
          (location) => {
            setDriverLocation({
              latitude: location.latitude,
              longitude: location.longitude,
            });
            
            // Calculate ETA
            const now = new Date();
            const estimatedMinutes = location.estimatedMinutes || 15;
            setEta(new Date(now.getTime() + estimatedMinutes * 60000));
            
            // Center map on driver
            if (mapRef.current) {
              mapRef.current.animateToRegion({
                latitude: location.latitude,
                longitude: location.longitude,
                latitudeDelta: 0.01,
                longitudeDelta: 0.01
              });
            }
          }
        );
      }
      
      // Subscribe to connection status
      const connectionSubscription = realTimeManager.subscribe('connection', (data) => {
        setIsConnected(data.status === 'connected');
      });
      
      return () => {
        if (orderSubscription) orderSubscription();
        if (driverLocationSubscription) driverLocationSubscription();
        connectionSubscription();
      };
    }
    
    // Mock real-time updates for testing purposes
    const mockInterval = setInterval(() => {
      const statusIndex = ORDER_STATUSES.findIndex(s => s.id === order.status);
      if (statusIndex >= 0 && statusIndex < ORDER_STATUSES.length - 1) {
        setOrder(prev => ({ ...prev, status: ORDER_STATUSES[statusIndex + 1].id }));
        
        // Add mock driver when status changes to "picked_up"
        if (ORDER_STATUSES[statusIndex + 1].id === 'picked_up' && !order.driver) {
          setOrder(prev => ({
            ...prev,
            driver: {
              id: 'driver_1',
              name: 'Alex Martinez',
              phone: '(555) 987-6543',
              photo: null,
              vehicle: { type: 'car', color: 'blue', model: 'Sedan' },
            }
          }));
        }
        
        // Add mock driver location when status changes to "on_the_way"
        if (ORDER_STATUSES[statusIndex + 1].id === 'on_the_way') {
          const mockDriverLocation = {
            latitude: order.restaurant.location.latitude + (Math.random() - 0.5) * 0.01,
            longitude: order.restaurant.location.longitude + (Math.random() - 0.5) * 0.01
          };
          setDriverLocation(mockDriverLocation);
          
          // Calculate mock ETA
          const now = new Date();
          setEta(new Date(now.getTime() + 15 * 60000)); // 15 minutes from now
        }
      }
    }, 15000); // Update every 15 seconds for demo purposes
    
    return () => clearInterval(mockInterval);
  }, [orderId, order.status, order.driver]);

  const getStatusIndex = (status: string) => {
    return ORDER_STATUSES.findIndex(s => s.id === status);
  };

  const currentStatusIndex = getStatusIndex(order.status);
  
  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };
  
  const formatEta = (date: Date | null) => {
    if (!date) return 'Calculating...';
    
    const now = new Date();
    const diffMinutes = Math.round((date.getTime() - now.getTime()) / 60000);
    
    if (diffMinutes <= 0) return 'Arriving now';
    return `${diffMinutes} minutes`;
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <ArrowLeft size={24} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Order #{orderId.substring(orderId.length - 4)}</Text>
        <View style={{ width: 24 }} />
      </View>
      
      <ScrollView style={styles.content}>
        {/* Order Status */}
        <Card style={styles.statusCard}>
          <View style={styles.statusHeader}>
            <Text style={styles.restaurantName}>{order.restaurant.name}</Text>
            <View style={styles.statusBadge}>
              <Text style={styles.statusText}>{
                ORDER_STATUSES.find(s => s.id === order.status)?.label || 'Processing'
              }</Text>
            </View>
          </View>
          
          <View style={styles.statusTimeline}>
            {ORDER_STATUSES.map((status, index) => {
              const isCompleted = currentStatusIndex >= index;
              const isCurrent = currentStatusIndex === index;
              const StatusIcon = status.icon;
              
              return (
                <View key={status.id} style={styles.statusStep}>
                  <View style={styles.statusIconContainer}>
                    {isCurrent ? (
                      <Animated.View style={[
                        styles.currentStatusIconRing,
                        { transform: [{ scale: pulseAnim }] }
                      ]}>
                        <StatusIcon 
                          size={24} 
                          color={Colors.primary} 
                          style={styles.statusIcon} 
                        />
                      </Animated.View>
                    ) : (
                      <View style={[
                        styles.statusIconBg,
                        isCompleted ? styles.completedStatusIconBg : styles.pendingStatusIconBg
                      ]}>
                        <StatusIcon 
                          size={16} 
                          color={isCompleted ? Colors.white : Colors.gray[400]}
                        />
                      </View>
                    )}
                    
                    {index < ORDER_STATUSES.length - 1 && (
                      <View style={[
                        styles.statusLine,
                        isCompleted ? styles.completedStatusLine : styles.pendingStatusLine
                      ]} />
                    )}
                  </View>
                  
                  <Text style={[
                    styles.statusLabel,
                    isCurrent && styles.currentStatusLabel,
                    isCompleted && styles.completedStatusLabel
                  ]}>
                    {status.label}
                  </Text>
                </View>
              );
            })}
          </View>
          
          {/* Estimated Delivery Time */}
          <View style={styles.estimatedTimeContainer}>
            <Clock size={18} color={Colors.primary} />
            <Text style={styles.estimatedTimeText}>
              {eta 
                ? `Estimated arrival: ${formatEta(eta)}`
                : `Estimated delivery: ${formatTime(order.estimatedDeliveryTime)}`
              }
            </Text>
          </View>
        </Card>
        
        {/* Driver Info - Only shown when driver is assigned */}
        {order.driver && ['picked_up', 'on_the_way'].includes(order.status) && (
          <Card style={styles.driverCard}>
            <View style={styles.driverHeader}>
              <View style={styles.driverInfo}>
                <View style={styles.driverAvatar}>
                  <Text style={styles.driverAvatarText}>
                    {order.driver.name.charAt(0)}
                  </Text>
                </View>
                <View>
                  <Text style={styles.driverName}>{order.driver.name}</Text>
                  <View style={styles.driverVehicle}>
                    <Text style={styles.driverVehicleText}>
                      {order.driver.vehicle.color} {order.driver.vehicle.model}
                    </Text>
                  </View>
                </View>
              </View>
              
              <View style={styles.driverActions}>
                <TouchableOpacity style={styles.driverActionButton}>
                  <Phone size={20} color={Colors.primary} />
                </TouchableOpacity>
                <TouchableOpacity style={styles.driverActionButton}>
                  <MessageCircle size={20} color={Colors.primary} />
                </TouchableOpacity>
              </View>
            </View>
            
            {/* Driver's realtime location on map */}
            <View style={styles.mapContainer}>
              <MapView
                ref={mapRef}
                style={styles.map}
                provider={PROVIDER_GOOGLE}
                initialRegion={{
                  latitude: order.restaurant.location.latitude,
                  longitude: order.restaurant.location.longitude,
                  latitudeDelta: 0.02,
                  longitudeDelta: 0.02,
                }}
              >
                {/* Restaurant Marker */}
                <Marker
                  coordinate={order.restaurant.location}
                  title={order.restaurant.name}
                >
                  <View style={styles.restaurantMarker}>
                    <MapPin size={24} color={Colors.primary} />
                  </View>
                </Marker>
                
                {/* Customer Marker */}
                <Marker
                  coordinate={order.customer.location}
                  title="Delivery Location"
                >
                  <View style={styles.customerMarker}>
                    <Home size={24} color={Colors.success} />
                  </View>
                </Marker>
                
                {/* Driver Marker - Only shown when location is available */}
                {driverLocation && (
                  <Marker
                    coordinate={driverLocation}
                    title={`Driver: ${order.driver.name}`}
                  >
                    <View style={styles.driverMarker}>
                      <Truck size={24} color={Colors.white} />
                    </View>
                  </Marker>
                )}
              </MapView>
              
              {!isConnected && (
                <View style={styles.connectionWarning}>
                  <Text style={styles.connectionWarningText}>
                    Offline mode - Location updates paused
                  </Text>
                </View>
              )}
            </View>
          </Card>
        )}
        
        {/* Order Details */}
        <Card style={styles.orderDetailsCard}>
          <Text style={styles.sectionTitle}>Order Details</Text>
          
          <View style={styles.orderItems}>
            {order.items.map((item, index) => (
              <View key={index} style={styles.orderItem}>
                <View style={styles.itemInfo}>
                  <Text style={styles.itemQuantity}>{item.quantity}x</Text>
                  <Text style={styles.itemName}>{item.name}</Text>
                </View>
                <Text style={styles.itemPrice}>${(item.price * item.quantity).toFixed(2)}</Text>
              </View>
            ))}
          </View>
          
          <View style={styles.separator} />
          
          <View style={styles.orderTotal}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalAmount}>${order.total.toFixed(2)}</Text>
          </View>
        </Card>
        
        {/* Delivery Information */}
        <Card style={styles.deliveryCard}>
          <Text style={styles.sectionTitle}>Delivery Information</Text>
          
          <View style={styles.deliveryDetail}>
            <MapPin size={18} color={Colors.textSecondary} />
            <Text style={styles.deliveryDetailText}>{order.customer.address}</Text>
          </View>
          
          <View style={styles.deliveryDetail}>
            <Clock size={18} color={Colors.textSecondary} />
            <Text style={styles.deliveryDetailText}>
              Ordered at {formatTime(order.createdAt)}
            </Text>
          </View>
        </Card>
        
        {/* Help Button */}
        <View style={styles.helpButtonContainer}>
          <Button
            title="Need Help?"
            onPress={() => router.push('/support')}
            variant="outline"
            fullWidth
          />
        </View>
        
        {/* Support options for completed orders */}
        {order.status === 'delivered' && (
          <Card style={styles.supportOptionsCard}>
            <Text style={styles.sectionTitle}>How was your order?</Text>
            <Link href={`/review?orderId=${order.id}`} asChild>
              <TouchableOpacity style={styles.supportOption}>
                <Text style={styles.supportOptionText}>Rate this order</Text>
                <ChevronRight size={20} color={Colors.textSecondary} />
              </TouchableOpacity>
            </Link>
            <TouchableOpacity style={styles.supportOption}>
              <Text style={styles.supportOptionText}>Report a problem</Text>
              <ChevronRight size={20} color={Colors.textSecondary} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.supportOption}>
              <Text style={styles.supportOptionText}>Reorder</Text>
              <ChevronRight size={20} color={Colors.textSecondary} />
            </TouchableOpacity>
          </Card>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const ChevronRight = ({ size, color }) => (
  <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
    <Text style={{ color }}>›</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    backgroundColor: Colors.white,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  statusCard: {
    marginBottom: 16,
  },
  statusHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  restaurantName: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
  },
  statusBadge: {
    backgroundColor: Colors.primary + '20',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.primary,
  },
  statusTimeline: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  statusStep: {
    flex: 1,
    alignItems: 'center',
  },
  statusIconContainer: {
    alignItems: 'center',
    position: 'relative',
    marginBottom: 8,
  },
  statusIconBg: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  completedStatusIconBg: {
    backgroundColor: Colors.primary,
  },
  pendingStatusIconBg: {
    backgroundColor: Colors.gray[200],
  },
  statusIcon: {
    zIndex: 2,
  },
  currentStatusIconRing: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.primary + '30',
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusLine: {
    position: 'absolute',
    top: 15,
    right: -50, // Half of step width
    width: 100, // Full step width
    height: 2,
    zIndex: 1,
  },
  completedStatusLine: {
    backgroundColor: Colors.primary,
  },
  pendingStatusLine: {
    backgroundColor: Colors.gray[200],
  },
  statusLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  currentStatusLabel: {
    color: Colors.primary,
    fontWeight: '600',
  },
  completedStatusLabel: {
    color: Colors.text,
  },
  estimatedTimeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: Colors.primary + '10',
    borderRadius: 8,
  },
  estimatedTimeText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.primary,
    marginLeft: 8,
  },
  driverCard: {
    marginBottom: 16,
    padding: 0,
    overflow: 'hidden',
  },
  driverHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  driverInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  driverAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  driverAvatarText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.white,
  },
  driverName: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 4,
  },
  driverVehicle: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  driverVehicleText: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  driverActions: {
    flexDirection: 'row',
    gap: 8,
  },
  driverActionButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.primary + '15',
    alignItems: 'center',
    justifyContent: 'center',
  },
  mapContainer: {
    width: '100%',
    height: 200,
    overflow: 'hidden',
    position: 'relative',
  },
  map: {
    width: '100%',
    height: '100%',
  },
  restaurantMarker: {
    backgroundColor: Colors.white,
    borderRadius: 20,
    padding: 4,
    borderWidth: 2,
    borderColor: Colors.primary,
  },
  customerMarker: {
    backgroundColor: Colors.white,
    borderRadius: 20,
    padding: 4,
    borderWidth: 2,
    borderColor: Colors.success,
  },
  driverMarker: {
    backgroundColor: Colors.primary,
    borderRadius: 20,
    padding: 4,
    borderWidth: 2,
    borderColor: Colors.white,
  },
  connectionWarning: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    right: 8,
    backgroundColor: 'rgba(0,0,0,0.7)',
    padding: 8,
    borderRadius: 8,
  },
  connectionWarningText: {
    color: Colors.white,
    fontSize: 12,
    textAlign: 'center',
  },
  orderDetailsCard: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 16,
  },
  orderItems: {
    marginBottom: 16,
  },
  orderItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  itemInfo: {
    flexDirection: 'row',
    flex: 1,
  },
  itemQuantity: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.primary,
    marginRight: 8,
    width: 24,
  },
  itemName: {
    fontSize: 16,
    color: Colors.text,
    flex: 1,
  },
  itemPrice: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
  },
  separator: {
    height: 1,
    backgroundColor: Colors.border,
    marginVertical: 16,
  },
  orderTotal: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
  },
  totalAmount: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.primary,
  },
  deliveryCard: {
    marginBottom: 16,
  },
  deliveryDetail: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  deliveryDetailText: {
    fontSize: 16,
    color: Colors.text,
    marginLeft: 12,
    flex: 1,
  },
  helpButtonContainer: {
    marginBottom: 16,
  },
  supportOptionsCard: {
    marginBottom: 16,
  },
  supportOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  supportOptionText: {
    fontSize: 16,
    color: Colors.text,
  },
});
