import { supabase } from '@/lib/supabase';
import { Driver, DeliveryAssignment } from '@/types/driver';

class DriverService {
  async getDriverProfile(userId: string): Promise<Driver | null> {
    const { data, error } = await supabase
      .from('drivers')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error) {
      console.error('Error fetching driver profile:', error);
      return null;
    }

    return data;
  }

  async updateDriverProfile(userId: string, updates: Partial<Driver>): Promise<Driver> {
    const { data, error } = await supabase
      .from('drivers')
      .update(updates)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async updateDriverLocation(driverId: string, location: { latitude: number; longitude: number }): Promise<void> {
    const { error } = await supabase
      .from('drivers')
      .update({ current_location: location })
      .eq('id', driverId);

    if (error) throw error;
  }

  async updateDriverStatus(driverId: string, status: string): Promise<void> {
    const { error } = await supabase
      .from('drivers')
      .update({ status })
      .eq('id', driverId);

    if (error) throw error;
  }

  async getAvailableDeliveries(driverId: string): Promise<DeliveryAssignment[]> {
    const { data, error } = await supabase
      .from('delivery_assignments')
      .select('*')
      .is('driver_id', null)
      .eq('status', 'pending')
      .order('created_at');

    if (error) throw error;
    return data || [];
  }

  async getDriverDeliveries(driverId: string): Promise<DeliveryAssignment[]> {
    const { data, error } = await supabase
      .from('delivery_assignments')
      .select('*')
      .eq('driver_id', driverId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  async acceptDelivery(deliveryId: string, driverId: string): Promise<DeliveryAssignment> {
    const { data, error } = await supabase
      .from('delivery_assignments')
      .update({ driver_id: driverId, status: 'accepted' })
      .eq('id', deliveryId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async updateDeliveryStatus(deliveryId: string, status: string): Promise<void> {
    const { error } = await supabase
      .from('delivery_assignments')
      .update({ status })
      .eq('id', deliveryId);

    if (error) throw error;
  }
}

export const driverService = new DriverService();
