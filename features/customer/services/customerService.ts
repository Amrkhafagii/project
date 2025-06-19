import { supabase } from '@/lib/supabase';
import { Customer, CustomerAddress, Order } from '@/types/customer';

class CustomerService {
  async getCustomerProfile(userId: string): Promise<Customer | null> {
    const { data, error } = await supabase
      .from('customers')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error) {
      console.error('Error fetching customer profile:', error);
      return null;
    }

    return data;
  }

  async updateCustomerProfile(userId: string, updates: Partial<Customer>): Promise<Customer> {
    const { data, error } = await supabase
      .from('customers')
      .update(updates)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async getCustomerAddresses(customerId: string): Promise<CustomerAddress[]> {
    const { data, error } = await supabase
      .from('customer_addresses')
      .select('*')
      .eq('customer_id', customerId)
      .order('is_default', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  async addCustomerAddress(address: Omit<CustomerAddress, 'id' | 'createdAt' | 'updatedAt'>): Promise<CustomerAddress> {
    const { data, error } = await supabase
      .from('customer_addresses')
      .insert(address)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async updateCustomerAddress(addressId: string, updates: Partial<CustomerAddress>): Promise<CustomerAddress> {
    const { data, error } = await supabase
      .from('customer_addresses')
      .update(updates)
      .eq('id', addressId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async deleteCustomerAddress(addressId: string): Promise<void> {
    const { error } = await supabase
      .from('customer_addresses')
      .delete()
      .eq('id', addressId);

    if (error) throw error;
  }

  async getCustomerOrders(customerId: string): Promise<Order[]> {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('customer_id', customerId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  async createOrder(order: Omit<Order, 'id' | 'createdAt' | 'updatedAt'>): Promise<Order> {
    const { data, error } = await supabase
      .from('orders')
      .insert(order)
      .select()
      .single();

    if (error) throw error;
    return data;
  }
}

export const customerService = new CustomerService();
