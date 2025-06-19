import { supabase } from '@/lib/supabase';
import { Restaurant, MenuItem, MenuCategory, InventoryItem } from '@/types/restaurant';

class RestaurantService {
  async getRestaurantProfile(userId: string): Promise<Restaurant | null> {
    const { data, error } = await supabase
      .from('restaurants')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error) {
      console.error('Error fetching restaurant profile:', error);
      return null;
    }

    return data;
  }

  async updateRestaurantProfile(userId: string, updates: Partial<Restaurant>): Promise<Restaurant> {
    const { data, error } = await supabase
      .from('restaurants')
      .update(updates)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async getRestaurants(filters?: {
    cuisine?: string[];
    priceRange?: number[];
    location?: { latitude: number; longitude: number; radius: number };
  }): Promise<Restaurant[]> {
    let query = supabase
      .from('restaurants')
      .select('*')
      .eq('is_active', true);

    if (filters?.cuisine && filters.cuisine.length > 0) {
      query = query.overlaps('cuisine', filters.cuisine);
    }

    if (filters?.priceRange && filters.priceRange.length === 2) {
      query = query
        .gte('price_range', filters.priceRange[0])
        .lte('price_range', filters.priceRange[1]);
    }

    const { data, error } = await query.order('rating', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  async getMenuCategories(restaurantId: string): Promise<MenuCategory[]> {
    const { data, error } = await supabase
      .from('menu_categories')
      .select('*')
      .eq('restaurant_id', restaurantId)
      .eq('is_active', true)
      .order('sort_order');

    if (error) throw error;
    return data || [];
  }

  async getMenuItems(restaurantId: string, categoryId?: string): Promise<MenuItem[]> {
    let query = supabase
      .from('menu_items')
      .select('*')
      .eq('restaurant_id', restaurantId)
      .eq('is_available', true);

    if (categoryId) {
      query = query.eq('category_id', categoryId);
    }

    const { data, error } = await query.order('popularity', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  async createMenuItem(item: Omit<MenuItem, 'id' | 'createdAt' | 'updatedAt'>): Promise<MenuItem> {
    const { data, error } = await supabase
      .from('menu_items')
      .insert(item)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async updateMenuItem(itemId: string, updates: Partial<MenuItem>): Promise<MenuItem> {
    const { data, error } = await supabase
      .from('menu_items')
      .update(updates)
      .eq('id', itemId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async getInventoryItems(restaurantId: string): Promise<InventoryItem[]> {
    const { data, error } = await supabase
      .from('inventory_items')
      .select('*')
      .eq('restaurant_id', restaurantId)
      .order('name');

    if (error) throw error;
    return data || [];
  }

  async updateInventoryItem(itemId: string, updates: Partial<InventoryItem>): Promise<InventoryItem> {
    const { data, error } = await supabase
      .from('inventory_items')
      .update(updates)
      .eq('id', itemId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }
}

export const restaurantService = new RestaurantService();
