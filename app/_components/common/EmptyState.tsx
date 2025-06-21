import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import {  LucideIcon } from 'lucide-react-native';
import { Colors, Layout } from '@/constants';

interface EmptyStateProps {
  Icon: LucideIcon;
  title: string;
  description: string;
  action?: React.ReactNode;
  iconSize?: number;
  style?: any;
}

export function EmptyState({ Icon, title, description, action, iconSize = 64, style }: EmptyStateProps) {
  return (
    <View style={[styles.container, style]}>
      <View style={styles.iconContainer}>
        <Icon size={iconSize} color={Colors.textTertiary} />
      </View>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.description}>{description}</Text>
      {action && <View style={styles.actionContainer}>{action}</View>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Layout.spacing.xl,
  },
  iconContainer: {
    marginBottom: Layout.spacing.lg,
  },
  title: {
    fontSize: Layout.fontSize.lg,
    fontWeight: '600',
    color: Colors.text,
    textAlign: 'center',
    marginBottom: Layout.spacing.sm,
  },
  description: {
    fontSize: Layout.fontSize.md,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: Layout.spacing.xl,
  },
  actionContainer: {
    width: '100%',
    maxWidth: 200,
  },
});

export default EmptyState;
