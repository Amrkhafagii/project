import { apiClient, ApiResponse } from '@/services/api/apiClient';

export interface Restaurant {
  id: string;
  name: string;
  description: string;
  cuisine_type: string;
  address: string;
  phone: string;
  email: string;
  rating: number;
  total_reviews: number;
  delivery_fee: number;
  minimum_order: number;
  estimated_delivery_time: number;
  is_active: boolean;
  image_url?: string;
  created_at: string;
  updated_at: string;
}

export interface MenuItem {
  id: string;
  restaurant_id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  is_available: boolean;
  prep_time: number;
  calories?: number;
  allergens?: string[];
  image_url?: string;
  created_at: string;
  updated_at: string;
}

export interface MenuCategory {
  id: string;
  restaurant_id: string;
  name: string;
  description?: string;
  sort_order: number;
  is_active: boolean;
}

class RestaurantService {
  async getAllRestaurants(): Promise<ApiResponse<Restaurant[]>> {
    return apiClient.get<Restaurant>('restaurants', {
      filters: { is_active: true },
      orderBy: { column: 'rating', ascending: false },
    });
  }

  async getRestaurantById(id: string): Promise<ApiResponse<Restaurant>> {
    return apiClient.getById<Restaurant>('restaurants', id);
  }

  async searchRestaurants(query: string): Promise<ApiResponse<Restaurant[]>> {
    // Note: This would need to be implemented with a proper search function
    // For now, we'll use a simple filter approach
    return apiClient.get<Restaurant>('restaurants', {
      filters: { is_active: true },
    });
  }

  async getRestaurantMenu(restaurantId: string): Promise<ApiResponse<MenuItem[]>> {
    return apiClient.get<MenuItem>('menu_items', {
      filters: { restaurant_id: restaurantId, is_available: true },
      orderBy: { column: 'category' },
    });
  }

  async getMenuCategories(restaurantId: string): Promise<ApiResponse<MenuCategory[]>> {
    return apiClient.get<MenuCategory>('menu_categories', {
      filters: { restaurant_id: restaurantId, is_active: true },
      orderBy: { column: 'sort_order' },
    });
  }

  async getMenuItemsByCategory(
    restaurantId: string,
    category: string
  ): Promise<ApiResponse<MenuItem[]>> {
    return apiClient.get<MenuItem>('menu_items', {
      filters: {
        restaurant_id: restaurantId,
        category,
        is_available: true,
      },
    });
  }

  async updateRestaurant(
    id: string,
    data: Partial<Restaurant>
  ): Promise<ApiResponse<Restaurant>> {
    return apiClient.update<Restaurant>('restaurants', id, data);
  }

  async createMenuItem(data: Partial<MenuItem>): Promise<ApiResponse<MenuItem>> {
    return apiClient.create<MenuItem>('menu_items', data);
  }

  async updateMenuItem(
    id: string,
    data: Partial<MenuItem>
  ): Promise<ApiResponse<MenuItem>> {
    return apiClient.update<MenuItem>('menu_items', id, data);
  }

  async deleteMenuItem(id: string): Promise<ApiResponse<void>> {
    return apiClient.delete('menu_items', id);
  }
}

export const restaurantService = new RestaurantService();
