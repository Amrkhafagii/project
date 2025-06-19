import { BaseEntity, Location, OrderStatus } from './common';

export interface Driver extends BaseEntity {
  userId: string;
  firstName: string;
  lastName: string;
  phone: string;
  avatar?: string;
  licenseNumber: string;
  vehicleInfo: VehicleInfo;
  rating: number;
  reviewCount: number;
  isOnline: boolean;
  currentLocation?: Location;
  status: DriverStatus;
  earnings: DriverEarnings;
  documents: DriverDocument[];
}

export interface VehicleInfo {
  make: string;
  model: string;
  year: number;
  color: string;
  licensePlate: string;
  type: 'car' | 'motorcycle' | 'bicycle' | 'scooter';
}

export enum DriverStatus {
  OFFLINE = 'offline',
  ONLINE = 'online',
  BUSY = 'busy',
  ON_DELIVERY = 'on_delivery'
}

export interface DriverEarnings {
  today: number;
  week: number;
  month: number;
  total: number;
  pendingPayout: number;
}

export interface DriverDocument {
  type: 'license' | 'insurance' | 'registration' | 'background_check';
  url: string;
  status: 'pending' | 'approved' | 'rejected';
  expirationDate?: string;
  uploadedAt: string;
}

export interface DeliveryAssignment extends BaseEntity {
  orderId: string;
  driverId: string;
  restaurantLocation: Location;
  deliveryLocation: Location;
  estimatedDistance: number;
  estimatedDuration: number;
  pickupTime?: string;
  deliveryTime?: string;
  earnings: number;
  status: OrderStatus;
}
