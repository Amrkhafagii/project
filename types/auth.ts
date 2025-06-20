export type UserRole = 'customer' | 'restaurant' | 'driver';

export interface UserProfile {
  user_id: string;
  full_name: string;
  role: UserRole | null;
  phone: string | null;
  onboarded: boolean;
  preferences?: any;
  fitness_profile?: any;
  created_at: string;
  updated_at: string;
}

export interface User {
  id: string;
  email: string;
  role: UserRole | null;
  firstName?: string;
  lastName?: string;
  phone?: string;
  avatar?: string;
  onboarded?: boolean;
  createdAt: string;
  updatedAt: string;
  preferences?: any;
  fitnessProfile?: any;
}

export interface AuthState {
  user: User | null;
  loading: boolean;
}
