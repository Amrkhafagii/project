import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, ViewStyle, TextStyle } from 'react-native';
import { Colors, Layout } from '@/constants';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'small' | 'medium' | 'large';
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  fullWidth?: boolean;
}

export function Button({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  loading = false,
  disabled = false,
  style,
  textStyle,
  fullWidth = false,
}: ButtonProps) {
  const buttonStyle = [
    styles.base,
    styles[variant],
    styles[size],
    fullWidth && styles.fullWidth,
    (disabled || loading) && styles.disabled,
    style,
  ];

  const textStyles = [
    styles.text,
    styles[`${variant}Text`],
    styles[`${size}Text`],
    textStyle,
  ];

  return (
    <TouchableOpacity
      style={buttonStyle}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.7}
    >
      {loading ? (
        <ActivityIndicator 
          size="small" 
          color={variant === 'primary' ? Colors.white : Colors.primary} 
        />
      ) : (
        <Text style={textStyles}>{title}</Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: Layout.borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  fullWidth: {
    width: '100%',
  },
  disabled: {
    opacity: 0.6,
  },
  
  // Variants
  primary: {
    backgroundColor: Colors.primary,
  },
  secondary: {
    backgroundColor: Colors.gray[100],
  },
  outline: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  ghost: {
    backgroundColor: 'transparent',
  },
  
  // Sizes
  small: {
    paddingHorizontal: Layout.spacing.md,
    paddingVertical: Layout.spacing.sm,
    minHeight: 36,
  },
  medium: {
    paddingHorizontal: Layout.spacing.lg,
    paddingVertical: Layout.spacing.md,
    minHeight: 44,
  },
  large: {
    paddingHorizontal: Layout.spacing.xl,
    paddingVertical: Layout.spacing.lg,
    minHeight: 52,
  },
  
  // Text styles
  text: {
    fontWeight: '600',
  },
  primaryText: {
    color: Colors.white,
  },
  secondaryText: {
    color: Colors.text,
  },
  outlineText: {
    color: Colors.primary,
  },
  ghostText: {
    color: Colors.primary,
  },
  
  // Text sizes
  smallText: {
    fontSize: Layout.fontSize.sm,
  },
  mediumText: {
    fontSize: Layout.fontSize.md,
  },
  largeText: {
    fontSize: Layout.fontSize.lg,
  },
});
