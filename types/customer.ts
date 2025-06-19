import { BaseEntity, Location, OrderStatus } from './common';

export interface Customer extends BaseEntity {
  userId: string;
  firstName: string;
  lastName: string;
  phone?: string;
  avatar?: string;
  addresses: CustomerAddress[];
  preferences: CustomerPreferences;
  loyaltyPoints: number;
  fitnessProfile?: FitnessProfile;
}

export interface CustomerAddress extends BaseEntity {
  customerId: string;
  label: string;
  location: Location;
  isDefault: boolean;
  instructions?: string;
}

export interface CustomerPreferences {
  dietaryRestrictions: string[];
  allergies: string[];
  favoriteCategories: string[];
  notificationSettings: NotificationSettings;
}

export interface NotificationSettings {
  orderUpdates: boolean;
  promotions: boolean;
  recommendations: boolean;
  fitness: boolean;
}

export interface FitnessProfile {
  height: number;
  weight: number;
  activityLevel: 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active';
  goals: string[];
  restrictions: string[];
}

export interface Order extends BaseEntity {
  customerId: string;
  restaurantId: string;
  driverId?: string;
  items: OrderItem[];
  subtotal: number;
  tax: number;
  deliveryFee: number;
  tip: number;
  total: number;
  status: OrderStatus;
  deliveryAddress: Location;
  estimatedDeliveryTime: string;
  actualDeliveryTime?: string;
  notes?: string;
}

export interface OrderItem {
  menuItemId: string;
  name: string;
  price: number;
  quantity: number;
  customizations: string[];
  specialInstructions?: string;
}
