export type UserRole = 'customer' | 'restaurant' | 'driver';

export interface User {
  id: string;
  email: string;
  role: UserRole;
  firstName?: string;
  lastName?: string;
  phone?: string;
  avatar?: string;
  onboarded?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AuthState {
  user: User | null;
  loading: boolean;
}
