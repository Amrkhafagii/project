import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { Colors, Layout } from '@/constants';

interface AvatarProps {
  source?: string | null;
  name?: string;
  size?: 'small' | 'medium' | 'large';
}

export default function Avatar({ source, name, size = 'medium' }: AvatarProps) {
  const sizeMap = {
    small: 32,
    medium: 48,
    large: 64,
  };

  const fontSize = {
    small: Layout.fontSize.sm,
    medium: Layout.fontSize.md,
    large: Layout.fontSize.lg,
  };

  const avatarSize = sizeMap[size];

  const getInitials = (name: string) => {
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  if (source) {
    return (
      <Image
        source={{ uri: source }}
        style={[
          styles.avatar,
          {
            width: avatarSize,
            height: avatarSize,
            borderRadius: avatarSize / 2,
          },
        ]}
      />
    );
  }

  return (
    <View
      style={[
        styles.avatar,
        styles.placeholder,
        {
          width: avatarSize,
          height: avatarSize,
          borderRadius: avatarSize / 2,
        },
      ]}
    >
      <Text style={[styles.initials, { fontSize: fontSize[size] }]}>
        {name ? getInitials(name) : '?'}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  avatar: {
    backgroundColor: Colors.surface,
  },
  placeholder: {
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  initials: {
    color: Colors.white,
    fontWeight: 'bold',
  },
});
