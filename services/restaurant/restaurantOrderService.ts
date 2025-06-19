import { useState, useEffect, useCallback } from 'react';
import { Alert } from 'react-native';
import { supabase } from '@/lib/supabase';
import { getRealTimeManager } from '@/services/realtime/realTimeManager';
import { calculateDynamicDeliveryFee } from '@/services/delivery/deliveryOptimization';

// Order type definition
interface OrderItem {
  id: string;
  menuItemId: string;
  name: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  specialInstructions?: string;
}

interface Order {
  id: string;
  status: string;
  customer: {
    id: string;
    name: string;
    address: string;
    phoneNumber: string;
  };
  items: OrderItem[];
  subtotal: number;
  deliveryFee: number;
  taxAmount: number;
  totalAmount: number;
  createdAt: string;
  estimatedDeliveryTime?: string;
  specialInstructions?: string;
  estimatedPrepTime?: number;
  driver?: {
    id: string;
    name: string;
    phoneNumber: string;
    rating: number;
  };
}

interface UseRestaurantOrdersResult {
  orders: Order[];
  loading: boolean;
  error: Error | null;
  refreshOrders: () => Promise<void>;
  getOrderStats: () => {
    totalOrders: number;
    totalRevenue: number;
    averageOrderValue: number;
    pendingOrders: number;
    preparingOrders: number;
    readyOrders: number;
  };
  acceptOrder: (orderId: string) => Promise<void>;
  rejectOrder: (orderId: string) => Promise<void>;
  updateOrderStatus: (orderId: string, status: string) => Promise<void>;
  assignDriver: (orderId: string, driverId: string) => Promise<void>;
  getAvailableDrivers: () => Promise<any[]>;
}

export function useRestaurantOrders(restaurantId: string): UseRestaurantOrdersResult {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [orderStats, setOrderStats] = useState({
    totalOrders: 0,
    totalRevenue: 0,
    averageOrderValue: 0,
    pendingOrders: 0,
    preparingOrders: 0,
    readyOrders: 0
  });

  // For demo purposes, we'll create some mock orders
  const createMockOrders = () => {
    // Example mock data
    const mockOrders: Order[] = [
      {
        id: 'order_1',
        status: 'pending',
        customer: {
          id: 'cust_1',
          name: 'John Smith',
          address: '123 Main St, Apt 4B',
          phoneNumber: '(555) 123-4567',
        },
        items: [
          {
            id: 'item_1',
            menuItemId: 'menu_1',
            name: 'Grilled Salmon Power Bowl',
            quantity: 1,
            unitPrice: 18.99,
            totalPrice: 18.99,
          },
          {
            id: 'item_2',
            menuItemId: 'menu_2',
            name: 'Green Smoothie',
            quantity: 1,
            unitPrice: 7.99,
            totalPrice: 7.99,
            specialInstructions: 'No banana please',
          },
        ],
        subtotal: 26.98,
        deliveryFee: 3.99,
        taxAmount: 2.16,
        totalAmount: 33.13,
        createdAt: new Date().toISOString(),
        specialInstructions: 'Please include extra napkins',
      },
      {
        id: 'order_2',
        status: 'accepted',
        customer: {
          id: 'cust_2',
          name: 'Emily Johnson',
          address: '456 Park Ave',
          phoneNumber: '(555) 987-6543',
        },
        items: [
          {
            id: 'item_3',
            menuItemId: 'menu_3',
            name: 'Chicken Protein Bowl',
            quantity: 2,
            unitPrice: 16.50,
            totalPrice: 33.00,
          },
        ],
        subtotal: 33.00,
        deliveryFee: 3.99,
        taxAmount: 2.64,
        totalAmount: 39.63,
        createdAt: new Date(Date.now() - 1800000).toISOString(), // 30 minutes ago
        estimatedPrepTime: 20,
      },
      {
        id: 'order_3',
        status: 'preparing',
        customer: {
          id: 'cust_3',
          name: 'Robert Chen',
          address: '789 Fitness Blvd',
          phoneNumber: '(555) 456-7890',
        },
        items: [
          {
            id: 'item_4',
            menuItemId: 'menu_4',
            name: 'Vegan Buddha Bowl',
            quantity: 1,
            unitPrice: 15.99,
            totalPrice: 15.99,
          },
          {
            id: 'item_5',
            menuItemId: 'menu_5',
            name: 'Protein Smoothie',
            quantity: 1,
            unitPrice: 8.99,
            totalPrice: 8.99,
          },
        ],
        subtotal: 24.98,
        deliveryFee: 3.99,
        taxAmount: 2.00,
        totalAmount: 30.97,
        createdAt: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
        estimatedPrepTime: 15,
      },
      {
        id: 'order_4',
        status: 'ready',
        customer: {
          id: 'cust_4',
          name: 'Samantha Lopez',
          address: '321 Healthy St',
          phoneNumber: '(555) 789-0123',
        },
        items: [
          {
            id: 'item_6',
            menuItemId: 'menu_6',
            name: 'Keto Power Plate',
            quantity: 1,
            unitPrice: 19.99,
            totalPrice: 19.99,
          },
        ],
        subtotal: 19.99,
        deliveryFee: 3.99,
        taxAmount: 1.60,
        totalAmount: 25.58,
        createdAt: new Date(Date.now() - 5400000).toISOString(), // 1.5 hours ago
        driver: {
          id: 'driver_1',
          name: 'Alex Martinez',
          phoneNumber: '(555) 111-2222',
          rating: 4.8,
        },
        estimatedPrepTime: 25,
      },
    ];
    return mockOrders;
  };

  // Fetch orders from the database
  const fetchOrders = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      // In a real app, this would fetch orders from Supabase
      // Example Supabase query:
      /*
      const { data, error } = await supabase
        .from('orders')
        .select(`
          id, status, subtotal, delivery_fee, tax_amount, total_amount, created_at, 
          estimated_delivery_time, special_instructions, estimated_prep_time,
          customers:customer_id (id, full_name, address, phone_number),
          order_items (id, menu_item_id, quantity, unit_price, total_price, special_instructions, 
                      menu_items:menu_item_id (name)),
          drivers:driver_id (id, full_name, phone_number, rating)
        `)
        .eq('restaurant_id', restaurantId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      // Transform the data into the Order type format
      const transformedOrders = data.map(order => ({
        id: order.id,
        status: order.status,
        customer: {
          id: order.customers.id,
          name: order.customers.full_name,
          address: order.customers.address,
          phoneNumber: order.customers.phone_number,
        },
        items: order.order_items.map(item => ({
          id: item.id,
          menuItemId: item.menu_item_id,
          name: item.menu_items.name,
          quantity: item.quantity,
          unitPrice: item.unit_price,
          totalPrice: item.total_price,
          specialInstructions: item.special_instructions,
        })),
        subtotal: order.subtotal,
        deliveryFee: order.delivery_fee,
        taxAmount: order.tax_amount,
        totalAmount: order.total_amount,
        createdAt: order.created_at,
        estimatedDeliveryTime: order.estimated_delivery_time,
        specialInstructions: order.special_instructions,
        estimatedPrepTime: order.estimated_prep_time,
        driver: order.drivers ? {
          id: order.drivers.id,
          name: order.drivers.full_name,
          phoneNumber: order.drivers.phone_number,
          rating: order.drivers.rating,
        } : undefined,
      }));
      
      setOrders(transformedOrders);
      */

      // Using mock data instead
      setOrders(createMockOrders());
      
      // Calculate order stats
      const mockOrders = createMockOrders();
      calculateOrderStats(mockOrders);
    } catch (err) {
      console.error("Error fetching orders:", err);
      setError(err instanceof Error ? err : new Error('Failed to fetch orders'));
    } finally {
      setLoading(false);
    }
  }, [restaurantId]);

  // Calculate order statistics
  const calculateOrderStats = (orderList: Order[]) => {
    const totalOrders = orderList.length;
    const totalRevenue = orderList.reduce((sum, order) => sum + order.totalAmount, 0);
    const averageOrderValue = totalRevenue / totalOrders || 0;
    
    const pendingOrders = orderList.filter(o => o.status === 'pending' || o.status === 'restaurant_assigned').length;
    const preparingOrders = orderList.filter(o => o.status === 'accepted' || o.status === 'preparing').length;
    const readyOrders = orderList.filter(o => o.status === 'ready').length;
    
    setOrderStats({
      totalOrders,
      totalRevenue,
      averageOrderValue,
      pendingOrders,
      preparingOrders,
      readyOrders
    });
  };

  // Listen for real-time updates
  useEffect(() => {
    fetchOrders();
    
    // Set up real-time subscription
    const realTimeManager = getRealTimeManager();
    let unsubscribe: (() => void) | undefined;
    
    if (realTimeManager) {
      unsubscribe = realTimeManager.subscribe('order_status_changed', (data) => {
        // Update the order in the local state
        setOrders(prevOrders => {
          return prevOrders.map(order => {
            if (order.id === data.orderId) {
              return {
                ...order,
                status: data.status,
              };
            }
            return order;
          });
        });
      });
    }
    
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [fetchOrders, restaurantId]);
  
  // Get order stats for analytics
  const getOrderStats = () => {
    // Return cached stats
    return orderStats;
  };

  // Accept an order
  const acceptOrder = async (orderId: string) => {
    try {
      // In a real app, this would update the order in Supabase
      // Example Supabase query:
      /*
      const { error } = await supabase
        .from('orders')
        .update({ 
          status: 'accepted',
          updated_at: new Date().toISOString()
        })
        .eq('id', orderId);
      
      if (error) throw error;
      */
      
      // Update local state
      setOrders(prevOrders => {
        return prevOrders.map(order => {
          if (order.id === orderId) {
            return {
              ...order,
              status: 'accepted',
            };
          }
          return order;
        });
      });
      
      // Notify via real-time service
      const realTimeManager = getRealTimeManager();
      if (realTimeManager) {
        realTimeManager.updateOrderStatus(orderId, 'accepted');
      }
    } catch (err) {
      console.error("Error accepting order:", err);
      throw err;
    }
  };

  // Reject an order
  const rejectOrder = async (orderId: string) => {
    try {
      // In a real app, this would update the order in Supabase
      // Example Supabase query:
      /*
      const { error } = await supabase
        .from('orders')
        .update({ 
          status: 'cancelled',
          cancel_reason: 'restaurant_rejected',
          updated_at: new Date().toISOString()
        })
        .eq('id', orderId);
      
      if (error) throw error;
      */
      
      // Update local state
      setOrders(prevOrders => {
        return prevOrders.map(order => {
          if (order.id === orderId) {
            return {
              ...order,
              status: 'cancelled',
            };
          }
          return order;
        });
      });
      
      // Notify via real-time service
      const realTimeManager = getRealTimeManager();
      if (realTimeManager) {
        realTimeManager.updateOrderStatus(orderId, 'cancelled');
      }
    } catch (err) {
      console.error("Error rejecting order:", err);
      throw err;
    }
  };

  // Update order status
  const updateOrderStatus = async (orderId: string, status: string) => {
    try {
      // In a real app, this would update the order in Supabase
      // Example Supabase query:
      /*
      const { error } = await supabase
        .from('orders')
        .update({ 
          status,
          updated_at: new Date().toISOString()
        })
        .eq('id', orderId);
      
      if (error) throw error;
      */
      
      // Update local state
      setOrders(prevOrders => {
        return prevOrders.map(order => {
          if (order.id === orderId) {
            return {
              ...order,
              status,
            };
          }
          return order;
        });
      });
      
      // Notify via real-time service
      const realTimeManager = getRealTimeManager();
      if (realTimeManager) {
        realTimeManager.updateOrderStatus(orderId, status);
      }
    } catch (err) {
      console.error("Error updating order status:", err);
      throw err;
    }
  };

  // Assign a driver to an order
  const assignDriver = async (orderId: string, driverId: string) => {
    try {
      // In a real app, this would update the order in Supabase
      // Example Supabase query:
      /*
      const { error } = await supabase
        .from('orders')
        .update({ 
          driver_id: driverId,
          driver_assigned_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', orderId);
      
      if (error) throw error;
      */
      
      // For demo purposes, let's assume we get the driver info from another API call
      const driverInfo = {
        id: driverId,
        name: 'Alex Martinez',
        phoneNumber: '(555) 111-2222',
        rating: 4.8,
      };
      
      // Update local state
      setOrders(prevOrders => {
        return prevOrders.map(order => {
          if (order.id === orderId) {
            return {
              ...order,
              driver: driverInfo,
            };
          }
          return order;
        });
      });
      
      // Notify via real-time service
      const realTimeManager = getRealTimeManager();
      if (realTimeManager) {
        realTimeManager.sendMessage('driver_assignment', {
          orderId,
          driverId,
          assignedAt: new Date().toISOString(),
        });
      }
    } catch (err) {
      console.error("Error assigning driver:", err);
      throw err;
    }
  };

  // Get available drivers
  const getAvailableDrivers = async () => {
    // In a real app, this would fetch available drivers from Supabase
    // For demo purposes, we'll return mock data
    return [
      {
        id: 'driver1',
        name: 'Alex Martinez',
        phoneNumber: '(555) 123-4567',
        rating: 4.8,
        vehicle: 'Car',
        location: {
          latitude: 40.7142,
          longitude: -74.0050,
        },
        isOnline: true,
        currentOrderCount: 0,
      },
      {
        id: 'driver2',
        name: 'Sarah Johnson',
        phoneNumber: '(555) 987-6543',
        rating: 4.9,
        vehicle: 'Car',
        location: {
          latitude: 40.7215,
          longitude: -74.0012,
        },
        isOnline: true,
        currentOrderCount: 1,
      },
    ];
  };

  return {
    orders,
    loading,
    error,
    getOrderStats,
    refreshOrders: fetchOrders,
    acceptOrder,
    rejectOrder,
    updateOrderStatus,
    assignDriver,
    getAvailableDrivers,
  };
}
