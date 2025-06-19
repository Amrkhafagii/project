import { BaseEntity, Location, TimeSlot } from './common';

export interface Restaurant extends BaseEntity {
  userId: string;
  name: string;
  description: string;
  cuisine: string[];
  logo?: string;
  coverImage?: string;
  location: Location;
  phone: string;
  email: string;
  rating: number;
  reviewCount: number;
  priceRange: 1 | 2 | 3 | 4;
  deliveryRadius: number;
  minimumOrder: number;
  deliveryFee: number;
  estimatedDeliveryTime: number;
  isOpen: boolean;
  operatingHours: OperatingHours;
  features: RestaurantFeature[];
}

export interface OperatingHours {
  monday: TimeSlot[];
  tuesday: TimeSlot[];
  wednesday: TimeSlot[];
  thursday: TimeSlot[];
  friday: TimeSlot[];
  saturday: TimeSlot[];
  sunday: TimeSlot[];
}

export interface RestaurantFeature {
  name: string;
  icon: string;
  description: string;
}

export interface MenuItem extends BaseEntity {
  restaurantId: string;
  categoryId: string;
  name: string;
  description: string;
  price: number;
  image?: string;
  ingredients: string[];
  allergens: string[];
  nutritionInfo?: NutritionInfo;
  customizations: MenuCustomization[];
  isAvailable: boolean;
  preparationTime: number;
  popularity: number;
}

export interface MenuCategory extends BaseEntity {
  restaurantId: string;
  name: string;
  description?: string;
  sortOrder: number;
  isActive: boolean;
}

export interface MenuCustomization {
  name: string;
  type: 'single' | 'multiple';
  required: boolean;
  options: CustomizationOption[];
}

export interface CustomizationOption {
  name: string;
  price: number;
  isDefault?: boolean;
}

export interface NutritionInfo {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  sugar: number;
  sodium: number;
}

export interface InventoryItem extends BaseEntity {
  restaurantId: string;
  name: string;
  category: string;
  currentStock: number;
  minimumStock: number;
  unit: string;
  costPerUnit: number;
  supplier?: string;
  expirationDate?: string;
  lastRestocked: string;
}
