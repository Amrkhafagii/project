import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { UserRole } from '@/types/auth';
import { Colors, Layout } from '@/constants';
import { User, Store, Truck } from 'lucide-react-native';

interface RoleSelectorProps {
  selectedRole: UserRole;
  onRoleSelect: (role: UserRole) => void;
  disabled?: boolean;
}

const roleConfig = {
  customer: {
    icon: User,
    color: Colors.customer,
    title: 'Customer',
    description: 'Order delicious food from local restaurants',
    features: ['Browse restaurants', 'Track orders', 'Rate & review'],
  },
  restaurant: {
    icon: Store,
    color: Colors.restaurant,
    title: 'Restaurant Owner',
    description: 'Manage your restaurant and grow your business',
    features: ['Manage menu', 'Process orders', 'Track analytics'],
  },
  driver: {
    icon: Truck,
    color: Colors.driver,
    title: 'Delivery Driver',
    description: 'Earn money delivering food to customers',
    features: ['Flexible schedule', 'Real-time navigation', 'Track earnings'],
  },
};

export function RoleSelector({ selectedRole, onRoleSelect, disabled = false }: RoleSelectorProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Choose Your Role</Text>
      <Text style={styles.subtitle}>Select how you'd like to use our platform</Text>
      
      <View style={styles.rolesContainer}>
        {(Object.keys(roleConfig) as UserRole[]).map((role) => {
          const config = roleConfig[role];
          const Icon = config.icon;
          const isSelected = selectedRole === role;
          
          return (
            <TouchableOpacity
              key={role}
              style={[
                styles.roleCard,
                isSelected && { ...styles.roleCardSelected, borderColor: config.color },
                disabled && styles.roleCardDisabled,
              ]}
              onPress={() => onRoleSelect(role)}
              disabled={disabled}
              activeOpacity={0.7}
            >
              <View style={[styles.iconContainer, { backgroundColor: config.color + '15' }]}>
                <Icon 
                  size={32} 
                  color={isSelected ? config.color : Colors.textSecondary} 
                />
              </View>
              
              <View style={styles.roleContent}>
                <Text style={[
                  styles.roleTitle,
                  isSelected && { color: config.color }
                ]}>
                  {config.title}
                </Text>
                
                <Text style={styles.roleDescription}>
                  {config.description}
                </Text>
                
                <View style={styles.featuresContainer}>
                  {config.features.map((feature, index) => (
                    <View key={index} style={styles.featureItem}>
                      <View style={[styles.featureDot, { backgroundColor: config.color }]} />
                      <Text style={styles.featureText}>{feature}</Text>
                    </View>
                  ))}
                </View>
              </View>
              
              <View style={[
                styles.radioButton,
                isSelected && { ...styles.radioButtonSelected, backgroundColor: config.color }
              ]}>
                {isSelected && <View style={styles.radioButtonInner} />}
              </View>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: Layout.spacing.lg,
  },
  title: {
    fontSize: Layout.fontSize.xl,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: Layout.spacing.sm,
    color: Colors.text,
  },
  subtitle: {
    fontSize: Layout.fontSize.md,
    textAlign: 'center',
    marginBottom: Layout.spacing.xl,
    color: Colors.textSecondary,
  },
  rolesContainer: {
    gap: Layout.spacing.md,
  },
  roleCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Layout.spacing.lg,
    borderWidth: 2,
    borderColor: Colors.border,
    borderRadius: Layout.borderRadius.lg,
    backgroundColor: Colors.background,
  },
  roleCardSelected: {
    backgroundColor: Colors.surface,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  roleCardDisabled: {
    opacity: 0.6,
  },
  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Layout.spacing.md,
  },
  roleContent: {
    flex: 1,
    marginRight: Layout.spacing.md,
  },
  roleTitle: {
    fontSize: Layout.fontSize.lg,
    fontWeight: '600',
    marginBottom: Layout.spacing.xs,
    color: Colors.text,
  },
  roleDescription: {
    fontSize: Layout.fontSize.sm,
    color: Colors.textSecondary,
    marginBottom: Layout.spacing.sm,
    lineHeight: 20,
  },
  featuresContainer: {
    gap: Layout.spacing.xs,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  featureDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    marginRight: Layout.spacing.sm,
  },
  featureText: {
    fontSize: Layout.fontSize.xs,
    color: Colors.textTertiary,
  },
  radioButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: Colors.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioButtonSelected: {
    borderColor: 'transparent',
  },
  radioButtonInner: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.white,
  },
});
