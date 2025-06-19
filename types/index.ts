// Common types used across the application

export interface User {
  id: string;
  email: string;
  full_name: string;
  role: 'customer' | 'restaurant' | 'driver';
  phone?: string;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
}

export interface Address {
  id: string;
  user_id: string;
  label: string;
  street_address: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
  latitude?: number;
  longitude?: number;
  is_default: boolean;
  created_at: string;
  updated_at: string;
}

export interface PaymentMethod {
  id: string;
  user_id: string;
  type: 'card' | 'paypal' | 'apple_pay' | 'google_pay';
  last_four?: string;
  brand?: string;
  is_default: boolean;
  created_at: string;
  updated_at: string;
}

export interface Coordinates {
  latitude: number;
  longitude: number;
}

export interface ApiError {
  message: string;
  code?: string;
  status?: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

export interface FilterOptions {
  search?: string;
  category?: string;
  priceRange?: [number, number];
  rating?: number;
  distance?: number;
  sortBy?: 'name' | 'rating' | 'distance' | 'price';
  sortOrder?: 'asc' | 'desc';
}

// Re-export service types for convenience
export type { Order, OrderItem } from '@/services/orders/orderService';
export type { Restaurant, MenuItem } from '@/services/restaurants/restaurantService';
