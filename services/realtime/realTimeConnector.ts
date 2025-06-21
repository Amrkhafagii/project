import { useEffect, useState } from 'react';
import { 
  initializeRealTimeManager,
  getRealTimeManager,
} from './realTimeManager';

// React hook for using the real-time manager in components
export function useRealTime(userId: string, userType: 'customer' | 'restaurant' | 'driver' = 'customer') {
  const [manager, setManager] = useState<RealTimeManager | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [connectionAttempts, setConnectionAttempts] = useState(0);

  useEffect(() => {
    if (!userId) return;

    // Initialize the real-time manager
    let rtManager: RealTimeManager;
    try {
      rtManager = initializeRealTimeManager(userId, userType);
      setManager(rtManager);

      // Subscribe to connection status
      const unsubscribeConnection = rtManager.subscribe('connection', (data) => {
        setIsConnected(data.status === 'connected');
        
        // If connection failed, increment attempt counter
        if (data.status === 'disconnected' && data.reason === 'error') {
          setConnectionAttempts(prev => prev + 1);
        }
      });

      return () => {
        unsubscribeConnection();
        rtManager.disconnect();
      };
    } catch (error) {
      console.error('Failed to initialize real-time manager:', error);
      setConnectionAttempts(prev => prev + 1);
    }
  }, [userId, userType, connectionAttempts]);

  // Auto-reconnect logic
  useEffect(() => {
    if (!isConnected && connectionAttempts > 0 && connectionAttempts < 5) {
      const reconnectTimeout = setTimeout(() => {
        console.log(`Attempting to reconnect (${connectionAttempts}/5)...`);
        const rtManager = initializeRealTimeManager(userId, userType);
        setManager(rtManager);
      }, Math.min(30000, connectionAttempts * 5000)); // Exponential backoff with 30s max
      
      return () => clearTimeout(reconnectTimeout);
    }
  }, [isConnected, connectionAttempts, userId, userType]);

  return { manager, isConnected };
}

// Factory function to create subscriptions for common real-time events
export function createOrderSubscription(orderId: string, callbacks: {
  onStatusChange?: (status: string) => void;
  onDriverAssigned?: (driverId: string, driverInfo: any) => void;
  onLocationUpdate?: (location: any) => void;
  onEtaUpdate?: (eta: any) => void;
}) {
  const realTimeManager = getRealTimeManager();
  if (!realTimeManager) return () => {};
  
  // Group of subscriptions
  const subscriptions: (() => void)[] = [];
  
  // Order status updates
  if (callbacks.onStatusChange) {
    const unsubscribe = realTimeManager.subscribe(`order_${orderId}`, (data) => {
      if (data.status) {
        callbacks.onStatusChange!(data.status);
      }
    });
    subscriptions.push(unsubscribe);
  }
  
  // Driver assignment
  if (callbacks.onDriverAssigned) {
    const unsubscribe = realTimeManager.subscribe('driver_assigned', (data) => {
      if (data.orderId === orderId) {
        callbacks.onDriverAssigned!(data.driverId, data.driverInfo);
      }
    });
    subscriptions.push(unsubscribe);
  }
  
  // Return a function that unsubscribes from all events
  return () => {
    subscriptions.forEach(unsubscribe => unsubscribe());
  };
}

// Hook to subscribe to a specific order's real-time updates
export function useOrderSubscription(orderId: string | null) {
  const [status, setStatus] = useState<string | null>(null);
  const [driverInfo, setDriverInfo] = useState<any | null>(null);
  const [driverLocation, setDriverLocation] = useState<any | null>(null);
  const [eta, setEta] = useState<any | null>(null);
  
  useEffect(() => {
    if (!orderId) return;
    
    const realTimeManager = getRealTimeManager();
    if (!realTimeManager) return;
    
    // Subscribe to order status changes
    const orderSubscription = realTimeManager.subscribe(`order_${orderId}`, (data) => {
      if (data.status) {
        setStatus(data.status);
      }
      
      if (data.driverId && !driverInfo) {
        setDriverInfo({
          id: data.driverId,
          name: data.driverName,
          phone: data.driverPhone,
          vehicle: data.vehicle,
        });
      }
    });
    
    // Return cleanup function
    return () => {
      orderSubscription();
    };
  }, [orderId]);
  
  // Subscribe to driver location when driver is assigned
  useEffect(() => {
    if (!driverInfo?.id) return;
    
    const realTimeManager = getRealTimeManager();
    if (!realTimeManager) return;
    
    // Subscribe to driver location updates
    const locationSubscription = realTimeManager.subscribe(`driver_location_${driverInfo.id}`, (data) => {
      setDriverLocation({
        latitude: data.latitude,
        longitude: data.longitude,
        heading: data.heading,
        speed: data.speed,
      });
      
      if (data.eta) {
        setEta(data.eta);
      }
    });
    
    // Return cleanup function
    return () => {
      locationSubscription();
    };
  }, [driverInfo?.id]);
  
  return {
    status,
    driverInfo,
    driverLocation,
    eta,
  };
}
