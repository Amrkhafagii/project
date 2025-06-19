import { UserRole } from '@/types/auth';

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
};

export const formatDate = (date: string | Date): string => {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(new Date(date));
};

export const formatTime = (date: string | Date): string => {
  return new Intl.DateTimeFormat('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  }).format(new Date(date));
};

export const getRoleDisplayName = (role: UserRole): string => {
  switch (role) {
    case 'customer':
      return 'Customer';
    case 'restaurant':
      return 'Restaurant Owner';
    case 'driver':
      return 'Delivery Driver';
    default:
      return 'User';
  }
};

export const getInitials = (firstName?: string, lastName?: string): string => {
  const first = firstName?.charAt(0)?.toUpperCase() || '';
  const last = lastName?.charAt(0)?.toUpperCase() || '';
  return `${first}${last}` || '?';
};

export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return `${text.substring(0, maxLength)}...`;
};
