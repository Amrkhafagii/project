import { UserRole } from '@/types/auth';

interface RoleConfig {
  label: string;
  description: string;
  icon: string;
  defaultRoute: string;
}

export const ROLE_CONFIG: Record<UserRole, RoleConfig> = {
  customer: {
    label: 'Customer',
    description: 'Order food from restaurants',
    icon: '🍽️',
    defaultRoute: '/(customer)',
  },
  restaurant: {
    label: 'Restaurant',
    description: 'Manage your restaurant and orders',
    icon: '🏪',
    defaultRoute: '/(restaurant)',
  },
  driver: {
    label: 'Driver',
    description: 'Deliver orders to customers',
    icon: '🚗',
    defaultRoute: '/(driver)',
  },
  admin: {
    label: 'Admin',
    description: 'Manage the platform',
    icon: '⚙️',
    defaultRoute: '/(admin)',
  },
};

export const AUTH_ERRORS = {
  INVALID_CREDENTIALS: 'Invalid email or password',
  USER_NOT_FOUND: 'User not found',
  EMAIL_ALREADY_EXISTS: 'An account with this email already exists',
  WEAK_PASSWORD: 'Password must be at least 6 characters',
  NETWORK_ERROR: 'Network error. Please check your connection',
  UNKNOWN_ERROR: 'An unexpected error occurred',
} as const;
