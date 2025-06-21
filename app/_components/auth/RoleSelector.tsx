import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { UserRole } from '@/types/auth';
import { Colors, Layout } from '@/constants';
import { ROLE_CONFIG } from '@/constants/auth';

interface RoleSelectorProps {
  selectedRole: UserRole;
  onRoleSelect: (role: UserRole) => void;
  disabled?: boolean;
}

export function RoleSelector({ 
  selectedRole, 
  onRoleSelect, 
  disabled = false 
}: RoleSelectorProps) {
  return (
    <View style={styles.container}>
      {Object.entries(ROLE_CONFIG).map(([value, config]) => (
        <TouchableOpacity
          key={value}
          style={[
            styles.roleOption,
            selectedRole === value && styles.roleOptionSelected,
            disabled && styles.roleOptionDisabled,
          ]}
          onPress={() => onRoleSelect(value as UserRole)}
          disabled={disabled}
        >
          <View style={styles.roleContent}>
            <View style={styles.roleHeader}>
              <Text style={styles.roleIcon}>{config.icon}</Text>
              <Text style={[
                styles.roleLabel,
                selectedRole === value && styles.roleLabelSelected,
              ]}>
                {config.label}
              </Text>
            </View>
            <Text style={[
              styles.roleDescription,
              selectedRole === value && styles.roleDescriptionSelected,
            ]}>
              {config.description}
            </Text>
          </View>
          <View style={[
            styles.radioButton,
            selectedRole === value && styles.radioButtonSelected,
          ]}>
            {selectedRole === value && (
              <View style={styles.radioButtonInner} />
            )}
          </View>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  roleOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Layout.spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Layout.borderRadius.md,
    marginBottom: Layout.spacing.sm,
    backgroundColor: Colors.surface,
  },
  roleOptionSelected: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primaryLight,
  },
  roleOptionDisabled: {
    opacity: 0.6,
  },
  roleContent: {
    flex: 1,
  },
  roleHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Layout.spacing.xs,
  },
  roleIcon: {
    fontSize: 24,
    marginRight: Layout.spacing.sm,
  },
  roleLabel: {
    fontSize: Layout.fontSize.md,
    fontWeight: '600',
    color: Colors.text,
  },
  roleLabelSelected: {
    color: Colors.primary,
  },
  roleDescription: {
    fontSize: Layout.fontSize.sm,
    color: Colors.textSecondary,
    marginLeft: 36,
  },
  roleDescriptionSelected: {
    color: Colors.primary,
  },
  radioButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: Layout.spacing.md,
  },
  radioButtonSelected: {
    borderColor: Colors.primary,
  },
  radioButtonInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: Colors.primary,
  },
});
