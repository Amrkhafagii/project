import { apiClient, ApiResponse } from '@/services/api/apiClient';

export interface Order {
  id: string;
  customer_id: string;
  restaurant_id: string;
  driver_id?: string;
  status: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'picked_up' | 'delivered' | 'cancelled';
  total_amount: number;
  delivery_fee: number;
  tax_amount: number;
  delivery_address: string;
  special_instructions?: string;
  estimated_delivery_time?: string;
  created_at: string;
  updated_at: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  menu_item_id: string;
  quantity: number;
  unit_price: number;
  special_requests?: string;
}

export interface CreateOrderData {
  restaurant_id: string;
  items: Array<{
    menu_item_id: string;
    quantity: number;
    unit_price: number;
    special_requests?: string;
  }>;
  delivery_address: string;
  special_instructions?: string;
}

class OrderService {
  async createOrder(orderData: CreateOrderData): Promise<ApiResponse<Order>> {
    // Calculate totals
    const subtotal = orderData.items.reduce(
      (sum, item) => sum + item.unit_price * item.quantity,
      0
    );
    const deliveryFee = 3.99;
    const taxAmount = subtotal * 0.08;
    const totalAmount = subtotal + deliveryFee + taxAmount;

    const order = {
      restaurant_id: orderData.restaurant_id,
      status: 'pending' as const,
      total_amount: totalAmount,
      delivery_fee: deliveryFee,
      tax_amount: taxAmount,
      delivery_address: orderData.delivery_address,
      special_instructions: orderData.special_instructions,
    };

    const result = await apiClient.create<Order>('orders', order);
    
    if (result.data && result.error === null) {
      // Create order items
      for (const item of orderData.items) {
        await apiClient.create('order_items', {
          order_id: result.data.id,
          ...item,
        });
      }
    }

    return result;
  }

  async getCustomerOrders(customerId: string): Promise<ApiResponse<Order[]>> {
    return apiClient.get<Order>('orders', {
      filters: { customer_id: customerId },
      orderBy: { column: 'created_at', ascending: false },
    });
  }

  async getRestaurantOrders(restaurantId: string): Promise<ApiResponse<Order[]>> {
    return apiClient.get<Order>('orders', {
      filters: { restaurant_id: restaurantId },
      orderBy: { column: 'created_at', ascending: false },
    });
  }

  async getDriverOrders(driverId: string): Promise<ApiResponse<Order[]>> {
    return apiClient.get<Order>('orders', {
      filters: { driver_id: driverId },
      orderBy: { column: 'created_at', ascending: false },
    });
  }

  async updateOrderStatus(
    orderId: string,
    status: Order['status']
  ): Promise<ApiResponse<Order>> {
    return apiClient.update<Order>('orders', orderId, { status });
  }

  async assignDriver(orderId: string, driverId: string): Promise<ApiResponse<Order>> {
    return apiClient.update<Order>('orders', orderId, { driver_id: driverId });
  }

  async getOrderItems(orderId: string): Promise<ApiResponse<OrderItem[]>> {
    return apiClient.get<OrderItem>('order_items', {
      filters: { order_id: orderId },
    });
  }
}

export const orderService = new OrderService();
