import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { Bell, CircleCheck as CheckCircle, CircleAlert as AlertCircle, Truck, Package } from 'lucide-react-native';
import { Colors, Layout } from '@/constants';
import { getRealTimeManager } from '@/services/realtime/realTimeManager';

interface RealTimeOrderUpdatesProps {
  orderId: string;
  onStatusChange?: (status: string) => void;
}

type OrderUpdate = {
  status: string;
  message: string;
  timestamp: string;
};

export function RealTimeOrderUpdates({ orderId, onStatusChange }: RealTimeOrderUpdatesProps) {
  const [updates, setUpdates] = useState<OrderUpdate[]>([]);
  const [showNotification, setShowNotification] = useState(false);
  const [currentNotification, setCurrentNotification] = useState<OrderUpdate | null>(null);
  const [opacity] = useState(new Animated.Value(0));
  
  useEffect(() => {
    const realTimeManager = getRealTimeManager();
    let unsubscribe: (() => void) | null = null;
    
    if (realTimeManager) {
      // Subscribe to order updates
      unsubscribe = realTimeManager.subscribe(`order_${orderId}`, (data) => {
        const update: OrderUpdate = {
          status: data.status,
          message: getMessageForStatus(data.status),
          timestamp: new Date().toISOString()
        };
        
        // Add to updates
        setUpdates(prev => [update, ...prev]);
        
        // Show notification
        showUpdateNotification(update);
        
        // Call the callback
        if (onStatusChange) {
          onStatusChange(data.status);
        }
      });
    }
    
    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [orderId]);
  
  const getMessageForStatus = (status: string): string => {
    switch (status) {
      case 'confirmed':
        return 'Your order has been confirmed by the restaurant!';
      case 'preparing':
        return 'The restaurant is now preparing your food';
      case 'ready':
        return 'Your order is ready for pickup';
      case 'picked_up':
        return 'Your order has been picked up by the driver';
      case 'on_the_way':
        return 'Your driver is on the way to your location';
      case 'delivered':
        return 'Your order has been delivered. Enjoy!';
      default:
        return 'Your order status has been updated';
    }
  };
  
  const getIconForStatus = (status: string) => {
    switch (status) {
      case 'confirmed':
        return <CheckCircle size={24} color={Colors.primary} />;
      case 'preparing':
      case 'ready':
        return <Package size={24} color={Colors.warning} />;
      case 'picked_up':
      case 'on_the_way':
        return <Truck size={24} color={Colors.success} />;
      case 'delivered':
        return <CheckCircle size={24} color={Colors.success} />;
      default:
        return <Bell size={24} color={Colors.primary} />;
    }
  };
  
  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };
  
  const showUpdateNotification = (update: OrderUpdate) => {
    setCurrentNotification(update);
    setShowNotification(true);
    
    // Animate in
    Animated.timing(opacity, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
    
    // Hide after 3 seconds
    setTimeout(() => {
      Animated.timing(opacity, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start(() => {
        setShowNotification(false);
      });
    }, 3000);
  };
  
  // If no updates, don't render anything
  if (updates.length === 0 && !showNotification) {
    return null;
  }
  
  return (
    <>
      {/* Real-time notification */}
      {showNotification && currentNotification && (
        <Animated.View 
          style={[
            styles.notification,
            { opacity }
          ]}
        >
          <View style={styles.notificationIcon}>
            {getIconForStatus(currentNotification.status)}
          </View>
          <View style={styles.notificationContent}>
            <Text style={styles.notificationTitle}>
              Order Update
            </Text>
            <Text style={styles.notificationMessage}>
              {currentNotification.message}
            </Text>
          </View>
        </Animated.View>
      )}
      
      {/* Updates history */}
      <View style={styles.container}>
        <View style={styles.header}>
          <Bell size={20} color={Colors.textSecondary} />
          <Text style={styles.headerTitle}>Order Updates</Text>
        </View>
        
        <View style={styles.timeline}>
          {updates.map((update, index) => (
            <View key={index} style={styles.timelineItem}>
              <View style={styles.timelineIconContainer}>
                <View style={styles.timelineIcon}>
                  {getIconForStatus(update.status)}
                </View>
                {index < updates.length - 1 && <View style={styles.timelineLine} />}
              </View>
              
              <View style={styles.timelineContent}>
                <Text style={styles.timelineTitle}>
                  {update.status.charAt(0).toUpperCase() + update.status.slice(1).replace(/_/g, ' ')}
                </Text>
                <Text style={styles.timelineMessage}>
                  {update.message}
                </Text>
                <Text style={styles.timelineTime}>
                  {formatTimestamp(update.timestamp)}
                </Text>
              </View>
            </View>
          ))}
        </View>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.white,
    borderRadius: Layout.borderRadius.lg,
    padding: Layout.spacing.md,
    marginBottom: Layout.spacing.lg,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Layout.spacing.md,
  },
  headerTitle: {
    fontSize: Layout.fontSize.md,
    fontWeight: '600',
    color: Colors.text,
    marginLeft: Layout.spacing.sm,
  },
  timeline: {
    paddingLeft: Layout.spacing.xs,
  },
  timelineItem: {
    flexDirection: 'row',
    marginBottom: Layout.spacing.lg,
  },
  timelineIconContainer: {
    alignItems: 'center',
    marginRight: Layout.spacing.md,
  },
  timelineIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.gray[100],
    alignItems: 'center',
    justifyContent: 'center',
  },
  timelineLine: {
    width: 2,
    flex: 1,
    backgroundColor: Colors.gray[200],
    position: 'absolute',
    top: 36,
    bottom: -12,
    left: 17,
  },
  timelineContent: {
    flex: 1,
  },
  timelineTitle: {
    fontSize: Layout.fontSize.md,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: Layout.spacing.xs,
  },
  timelineMessage: {
    fontSize: Layout.fontSize.sm,
    color: Colors.textSecondary,
    marginBottom: Layout.spacing.xs,
  },
  timelineTime: {
    fontSize: Layout.fontSize.xs,
    color: Colors.textTertiary,
  },
  notification: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 999,
    backgroundColor: Colors.white,
    flexDirection: 'row',
    margin: Layout.spacing.md,
    padding: Layout.spacing.md,
    borderRadius: Layout.borderRadius.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  notificationIcon: {
    marginRight: Layout.spacing.md,
  },
  notificationContent: {
    flex: 1,
  },
  notificationTitle: {
    fontSize: Layout.fontSize.md,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: Layout.spacing.xs,
  },
  notificationMessage: {
    fontSize: Layout.fontSize.sm,
    color: Colors.textSecondary,
  },
});

export default RealTimeOrderUpdates;
