import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ViewStyle,
} from 'react-native';
import { Colors } from '@/constants';

interface AvatarProps {
  name: string;
  size?: number;
  style?: ViewStyle;
}

export function Avatar({ name, size = 40, style }: AvatarProps) {
  const initial = name.charAt(0).toUpperCase();
  
  return (
    <View style={[
      styles.container,
      {
        width: size,
        height: size,
        borderRadius: size / 2,
      },
      style,
    ]}>
      <Text style={[styles.text, { fontSize: size * 0.4 }]}>
        {initial}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.primary + '20',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontWeight: 'bold',
    color: Colors.primary,
  },
});
