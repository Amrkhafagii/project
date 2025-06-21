import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
} from 'react-native';
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
}

export default function Button({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  loading = false,
  disabled = false,
  style,
  textStyle,
}: ButtonProps) {
  const sizeStyles = {
    small: {
      paddingVertical: Layout.spacing.sm,
      paddingHorizontal: Layout.spacing.md,
    },
    medium: {
      paddingVertical: Layout.spacing.md,
      paddingHorizontal: Layout.spacing.lg,
    },
    large: {
      paddingVertical: Layout.spacing.lg,
      paddingHorizontal: Layout.spacing.xl,
    },
  };

  const textSizeStyles = {
    small: { fontSize: Layout.fontSize.sm },
    medium: { fontSize: Layout.fontSize.md },
    large: { fontSize: Layout.fontSize.lg },
  };

  const variantStyles = {
    primary: {
      backgroundColor: Colors.primary,
      borderWidth: 0,
    },
    secondary: {
      backgroundColor: Colors.secondary,
      borderWidth: 0,
    },
    outline: {
      backgroundColor: 'transparent',
      borderWidth: 1,
      borderColor: Colors.primary,
    },
    ghost: {
      backgroundColor: 'transparent',
      borderWidth: 0,
    },
  };

  const variantTextStyles = {
    primary: { color: Colors.white },
    secondary: { color: Colors.white },
    outline: { color: Colors.primary },
    ghost: { color: Colors.primary },
  };

  const isDisabled = disabled || loading;

  return (
    <TouchableOpacity
      style={[
        styles.button,
        sizeStyles[size],
        variantStyles[variant],
        isDisabled && styles.disabled,
        style,
      ]}
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.7}
    >
      {loading ? (
        <ActivityIndicator
          color={variant === 'outline' || variant === 'ghost' ? Colors.primary : Colors.white}
          size="small"
        />
      ) : (
        <Text
          style={[
            styles.text,
            textSizeStyles[size],
            variantTextStyles[variant],
            isDisabled && styles.disabledText,
            textStyle,
          ]}
        >
          {title}
        </Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    borderRadius: Layout.borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontWeight: '600',
  },
  disabled: {
    opacity: 0.5,
  },
  disabledText: {
    opacity: 0.7,
  },
});
