interface WebSocketMessage {
  type: 'order_update' | 'driver_location' | 'inventory_update' | 'driver_assignment' | 'system_notification';
  data: any;
  timestamp: string;
  userId?: string;
  orderId?: string;
  driverId?: string;
  restaurantId?: string;
}

interface DriverLocation {
  driverId: string;
  latitude: number;
  longitude: number;
  heading: number;
  speed: number;
  accuracy: number;
  timestamp: string;
  isOnline: boolean;
  currentOrderId?: string;
}

interface OrderStatusUpdate {
  orderId: string;
  status: 'pending' | 'restaurant_assigned' | 'accepted' | 'preparing' | 'ready' | 'picked_up' | 'on_the_way' | 'delivered' | 'cancelled';
  timestamp: string;
  estimatedTime?: number;
  driverLocation?: { latitude: number; longitude: number };
  notes?: string;
}

interface InventoryUpdate {
  restaurantId: string;
  menuItemId: string;
  currentStock: number;
  isAvailable: boolean;
  lastUpdated: string;
  autoDisabled?: boolean;
}

interface SystemNotification {
  id: string;
  type: 'info' | 'warning' | 'error' | 'success';
  title: string;
  message: string;
  targetAudience: 'all' | 'customers' | 'restaurants' | 'drivers';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  expiresAt?: string;
}

export class RealTimeManager {
  private ws: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectInterval = 1000;
  private heartbeatInterval: NodeJS.Timeout | null = null;
  private subscribers: Map<string, Array<(data: any) => void>> = new Map();
  private isConnected = false;

  constructor(private userId: string, private userType: 'customer' | 'restaurant' | 'driver') {
    this.connect();
  }

  private connect() {
    try {
      // In production, this would be wss://your-websocket-server.com
      const wsUrl = `ws://localhost:8080/ws?userId=${this.userId}&userType=${this.userType}`;
      this.ws = new WebSocket(wsUrl);

      this.ws.onopen = () => {
        console.log('WebSocket connected');
        this.isConnected = true;
        this.reconnectAttempts = 0;
        this.startHeartbeat();
        this.emit('connection', { status: 'connected' });
      };

      this.ws.onmessage = (event) => {
        try {
          const message: WebSocketMessage = JSON.parse(event.data);
          this.handleMessage(message);
        } catch (error) {
          console.error('Failed to parse WebSocket message:', error);
        }
      };

      this.ws.onclose = () => {
        console.log('WebSocket disconnected');
        this.isConnected = false;
        this.stopHeartbeat();
        this.emit('connection', { status: 'disconnected' });
        this.attemptReconnect();
      };

      this.ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        this.emit('error', { error });
      };
    } catch (error) {
      console.error('Failed to connect WebSocket:', error);
      this.attemptReconnect();
    }
  }

  private handleMessage(message: WebSocketMessage) {
    const { type, data } = message;
    
    // Emit to specific subscribers
    this.emit(type, data);
    
    // Also emit to general message subscribers
    this.emit('message', message);

    // Handle specific message types
    switch (type) {
      case 'order_update':
        this.handleOrderUpdate(data as OrderStatusUpdate);
        break;
      case 'driver_location':
        this.handleDriverLocation(data as DriverLocation);
        break;
      case 'inventory_update':
        this.handleInventoryUpdate(data as InventoryUpdate);
        break;
      case 'driver_assignment':
        this.handleDriverAssignment(data);
        break;
      case 'system_notification':
        this.handleSystemNotification(data as SystemNotification);
        break;
    }
  }

  private handleOrderUpdate(update: OrderStatusUpdate) {
    // Store order status in local cache for quick access
    this.updateLocalOrderStatus(update);
    
    // Emit specific order update
    this.emit(`order_${update.orderId}`, update);
    
    // Emit general order updates
    this.emit('order_status_changed', update);
  }

  private handleDriverLocation(location: DriverLocation) {
    // Update driver location in cache
    this.updateDriverLocation(location);
    
    // Emit location update for specific driver
    this.emit(`driver_location_${location.driverId}`, location);
    
    // If this driver is handling current user's order, emit order location update
    if (location.currentOrderId) {
      this.emit(`order_location_${location.currentOrderId}`, location);
    }
  }

  private handleInventoryUpdate(update: InventoryUpdate) {
    // Update local inventory cache
    this.updateLocalInventory(update);
    
    // Emit inventory update
    this.emit(`inventory_${update.restaurantId}`, update);
    this.emit('inventory_changed', update);
  }

  private handleDriverAssignment(assignment: any) {
    this.emit('driver_assigned', assignment);
  }

  private handleSystemNotification(notification: SystemNotification) {
    // Check if notification is relevant to current user
    if (notification.targetAudience === 'all' || notification.targetAudience === this.userType) {
      this.emit('system_notification', notification);
    }
  }

  private attemptReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      const delay = this.reconnectInterval * Math.pow(2, this.reconnectAttempts - 1);
      
      setTimeout(() => {
        console.log(`Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
        this.connect();
      }, delay);
    } else {
      console.error('Max reconnection attempts reached');
      this.emit('connection_failed', { reason: 'Max attempts reached' });
    }
  }

  private startHeartbeat() {
    this.heartbeatInterval = setInterval(() => {
      if (this.ws && this.ws.readyState === WebSocket.OPEN) {
        this.ws.send(JSON.stringify({
          type: 'heartbeat',
          timestamp: new Date().toISOString(),
        }));
      }
    }, 30000); // Send heartbeat every 30 seconds
  }

  private stopHeartbeat() {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
  }

  // Public API methods

  subscribe(event: string, callback: (data: any) => void): () => void {
    if (!this.subscribers.has(event)) {
      this.subscribers.set(event, []);
    }
    this.subscribers.get(event)!.push(callback);

    // Return unsubscribe function
    return () => {
      const callbacks = this.subscribers.get(event);
      if (callbacks) {
        const index = callbacks.indexOf(callback);
        if (index > -1) {
          callbacks.splice(index, 1);
        }
      }
    };
  }

  emit(event: string, data: any) {
    const callbacks = this.subscribers.get(event);
    if (callbacks) {
      callbacks.forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error(`Error in event callback for ${event}:`, error);
        }
      });
    }
  }

  // Send messages to server
  sendMessage(type: string, data: any) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      const message: WebSocketMessage = {
        type: type as any,
        data,
        timestamp: new Date().toISOString(),
        userId: this.userId,
      };
      
      this.ws.send(JSON.stringify(message));
    } else {
      console.warn('WebSocket not connected, message not sent:', { type, data });
    }
  }

  // Driver-specific methods
  updateDriverLocation(location: Omit<DriverLocation, 'timestamp'>) {
    this.sendMessage('driver_location_update', {
      ...location,
      timestamp: new Date().toISOString(),
    });
  }

  // Restaurant-specific methods
  updateInventory(restaurantId: string, menuItemId: string, currentStock: number, isAvailable: boolean) {
    this.sendMessage('inventory_update', {
      restaurantId,
      menuItemId,
      currentStock,
      isAvailable,
      lastUpdated: new Date().toISOString(),
    });
  }

  // Order management methods
  updateOrderStatus(orderId: string, status: OrderStatusUpdate['status'], notes?: string) {
    this.sendMessage('order_status_update', {
      orderId,
      status,
      timestamp: new Date().toISOString(),
      notes,
    });
  }

  // Local cache management
  private updateLocalOrderStatus(update: OrderStatusUpdate) {
    // In a real app, this would update local storage or state management
    console.log('Order status updated:', update);
  }

  private updateDriverLocation(location: DriverLocation) {
    // In a real app, this would update local cache
    console.log('Driver location updated:', location);
  }

  private updateLocalInventory(update: InventoryUpdate) {
    // In a real app, this would update local inventory cache
    console.log('Inventory updated:', update);
  }

  // Connection status
  isWebSocketConnected(): boolean {
    return this.isConnected && this.ws?.readyState === WebSocket.OPEN;
  }

  // Cleanup
  disconnect() {
    this.stopHeartbeat();
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.subscribers.clear();
  }
}

// Singleton instances for different user types
let realTimeManagerInstance: RealTimeManager | null = null;

export function initializeRealTimeManager(userId: string, userType: 'customer' | 'restaurant' | 'driver'): RealTimeManager {
  if (realTimeManagerInstance) {
    realTimeManagerInstance.disconnect();
  }
  
  realTimeManagerInstance = new RealTimeManager(userId, userType);
  return realTimeManagerInstance;
}

export function getRealTimeManager(): RealTimeManager | null {
  return realTimeManagerInstance;
}

// React hook for easy integration
import { useEffect, useState } from 'react';

export function useRealTime(userId: string, userType: 'customer' | 'restaurant' | 'driver') {
  const [manager, setManager] = useState<RealTimeManager | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const rtManager = initializeRealTimeManager(userId, userType);
    setManager(rtManager);

    const unsubscribeConnection = rtManager.subscribe('connection', (data) => {
      setIsConnected(data.status === 'connected');
    });

    return () => {
      unsubscribeConnection();
      rtManager.disconnect();
    };
  }, [userId, userType]);

  return { manager, isConnected };
}
