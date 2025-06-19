export const Colors = {
  // Brand Colors
  primary: '#007AFF',
  secondary: '#10B981',
  accent: '#F59E0B',
  
  // Role-specific Colors
  customer: '#007AFF',
  restaurant: '#10B981',
  driver: '#F59E0B',
  
  // UI Colors
  background: '#FFFFFF',
  surface: '#F9F9F9',
  border: '#E5E5EA',
  divider: '#F3F4F6',
  
  // Text Colors
  text: '#1A1A1A',
  textSecondary: '#666666',
  textTertiary: '#8E8E93',
  
  // Status Colors
  success: '#10B981',
  warning: '#F59E0B',
  error: '#EF4444',
  info: '#3B82F6',
  
  // Semantic Colors
  white: '#FFFFFF',
  black: '#000000',
  gray: {
    50: '#F9FAFB',
    100: '#F3F4F6',
    200: '#E5E7EB',
    300: '#D1D5DB',
    400: '#9CA3AF',
    500: '#6B7280',
    600: '#4B5563',
    700: '#374151',
    800: '#1F2937',
    900: '#111827',
  },
};

export const getColorByRole = (role: 'customer' | 'restaurant' | 'driver') => {
  return Colors[role];
};
