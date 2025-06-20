export const Colors = {
  // Primary colors
  primary: '#FF6B6B',
  primaryDark: '#FF5252',
  primaryLight: '#FF8787',
  
  // Secondary colors
  secondary: '#4ECDC4',
  secondaryDark: '#45B7AA',
  secondaryLight: '#6FD8D0',
  
  // Accent colors
  accent: '#FFE66D',
  accentDark: '#FFD93D',
  accentLight: '#FFF59D',
  
  // Neutral colors
  background: '#FFFFFF',
  surface: '#F8F9FA',
  text: '#212529',
  textSecondary: '#6C757D',
  textLight: '#ADB5BD',
  
  // Semantic colors
  success: '#28A745',
  warning: '#FFC107',
  error: '#DC3545',
  info: '#17A2B8',
  
  // UI colors
  border: '#DEE2E6',
  divider: '#E9ECEF',
  overlay: 'rgba(0, 0, 0, 0.5)',
  
  // Specific UI elements
  white: '#FFFFFF',
  black: '#000000',
  transparent: 'transparent',
  
  // Gray scale
  gray: {
    50: '#F8F9FA',
    100: '#E9ECEF',
    200: '#DEE2E6',
    300: '#CED4DA',
    400: '#ADB5BD',
    500: '#6C757D',
    600: '#495057',
    700: '#343A40',
    800: '#212529',
    900: '#191C1F',
  },
};

export const Layout = {
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
  },
  
  borderRadius: {
    sm: 4,
    md: 8,
    lg: 12,
    xl: 16,
    full: 9999,
  },
  
  fontSize: {
    xs: 10,
    sm: 12,
    md: 14,
    lg: 16,
    xl: 20,
    xxl: 24,
    xxxl: 32,
  },
  
  lineHeight: {
    tight: 1.2,
    normal: 1.5,
    relaxed: 1.75,
  },
  
  shadow: {
    sm: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 2,
      elevation: 2,
    },
    md: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 4,
    },
    lg: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.15,
      shadowRadius: 8,
      elevation: 8,
    },
  },
};

export const Typography = {
  heading: {
    h1: {
      fontSize: Layout.fontSize.xxxl,
      fontWeight: '700' as const,
      lineHeight: Layout.lineHeight.tight,
    },
    h2: {
      fontSize: Layout.fontSize.xxl,
      fontWeight: '600' as const,
      lineHeight: Layout.lineHeight.tight,
    },
    h3: {
      fontSize: Layout.fontSize.xl,
      fontWeight: '600' as const,
      lineHeight: Layout.lineHeight.normal,
    },
    h4: {
      fontSize: Layout.fontSize.lg,
      fontWeight: '600' as const,
      lineHeight: Layout.lineHeight.normal,
    },
  },
  body: {
    large: {
      fontSize: Layout.fontSize.lg,
      lineHeight: Layout.lineHeight.relaxed,
    },
    regular: {
      fontSize: Layout.fontSize.md,
      lineHeight: Layout.lineHeight.normal,
    },
    small: {
      fontSize: Layout.fontSize.sm,
      lineHeight: Layout.lineHeight.normal,
    },
  },
  caption: {
    fontSize: Layout.fontSize.xs,
    lineHeight: Layout.lineHeight.normal,
  },
};

export const Animation = {
  duration: {
    fast: 200,
    normal: 300,
    slow: 500,
  },
  easing: {
    easeIn: 'ease-in',
    easeOut: 'ease-out',
    easeInOut: 'ease-in-out',
  },
};

export default {
  Colors,
  Layout,
  Typography,
  Animation,
};
