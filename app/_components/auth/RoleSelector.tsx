import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Layout } from '@/constants';
import { UserRole } from '@/types/auth';
import { ROLE_CONFIG } from '@/constants/auth';

interface RoleSelectorProps {
  selectedRole: UserRole | null;
  onRoleSelect: (role: UserRole) => void;
}

export default function RoleSelector({ selectedRole, onRoleSelect }: RoleSelectorProps) {
  const roles: UserRole[] = ['customer', 'driver', 'restaurant'];

  return (
    <View style={styles.container}>
      {roles.map((role) => {
        const config = ROLE_CONFIG[role];
        const isSelected = selectedRole === role;

        return (
          <TouchableOpacity
            key={role}
            style={[styles.roleCard, isSelected && styles.selectedCard]}
            onPress={() => onRoleSelect(role)}
            activeOpacity={0.7}
          >
            <Ionicons
              name={config.icon as any}
              size={32}
              color={isSelected ? Colors.primary : Colors.textSecondary}
            />
            <Text style={[styles.roleTitle, isSelected && styles.selectedText]}>
              {config.label}
            </Text>
            <Text style={styles.roleDescription}>
              {config.description}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: Layout.spacing.lg,
  },
  roleCard: {
    backgroundColor: Colors.surface,
    borderRadius: Layout.borderRadius.md,
    padding: Layout.spacing.lg,
    marginBottom: Layout.spacing.md,
    borderWidth: 2,
    borderColor: Colors.border,
    alignItems: 'center',
  },
  selectedCard: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primaryLight,
  },
  roleTitle: {
    fontSize: Layout.fontSize.lg,
    fontWeight: '600',
    color: Colors.text,
    marginTop: Layout.spacing.sm,
    marginBottom: Layout.spacing.xs,
  },
  selectedText: {
    color: Colors.primary,
  },
  roleDescription: {
    fontSize: Layout.fontSize.sm,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
});
