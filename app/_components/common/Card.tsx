import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { Colors, Layout } from '@/constants';

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  padding?: keyof typeof Layout.spacing;
  shadow?: boolean;
}

export function Card({ 
  children, 
  style, 
  padding = 'md',
  shadow = true 
}: CardProps) {
  return (
    <View style={[
      styles.card,
      { padding: Layout.spacing[padding] },
      shadow && styles.shadow,
      style,
    ]}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.background,
    borderRadius: Layout.borderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  shadow: {
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
});
