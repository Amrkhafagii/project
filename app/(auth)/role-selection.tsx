import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Alert,
} from 'react-native';
import { router } from 'expo-router';
import { useAuth } from '@/hooks/useAuth';
import { UserRole } from '@/types/auth';
import { Colors, Layout } from '@/constants';
import RoleSelector  from '@/app/_components/auth/RoleSelector';
import  Button  from '@/app/_components/common/Button';
import AuthLayout from '@/app/_components/auth/AuthLayout';
import  Avatar  from '@/app/_components/common/Avatar';

export default function RoleSelectionScreen() {
  const [selectedRole, setSelectedRole] = useState<UserRole>('customer');
  const [loading, setLoading] = useState(false);
  const { user, updateProfile } = useAuth();

  const handleContinue = useCallback(async () => {
    if (!user) {
      Alert.alert('Error', 'No user found');
      return;
    }

    setLoading(true);
    try {
      await updateProfile({ role: selectedRole });
      router.replace('/');
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to update role');
    } finally {
      setLoading(false);
    }
  }, [user, selectedRole, updateProfile]);

  return (
    <AuthLayout
      title="Join Zenith!"
      subtitle="Select your role to customize your experience"
    >
      <View style={styles.avatarContainer}>
        <Avatar
          name={user?.email || '?'}
          size={80}
          style={styles.avatar}
        />
        <Text style={styles.emailText}>{user?.email}</Text>
      </View>

      <RoleSelector
        selectedRole={selectedRole}
        onRoleSelect={setSelectedRole}
        disabled={loading}
      />

      <View style={styles.footer}>
        <Button
          title={loading ? 'Setting up...' : 'Continue'}
          onPress={handleContinue}
          loading={loading}
          fullWidth
          size="large"
        />
        
        <Text style={styles.footerNote}>
          You can change this later in your profile settings
        </Text>
      </View>
    </AuthLayout>
  );
}

const styles = StyleSheet.create({
  avatarContainer: {
    alignItems: 'center',
    marginBottom: Layout.spacing.xl,
  },
  avatar: {
    marginBottom: Layout.spacing.sm,
  },
  emailText: {
    fontSize: Layout.fontSize.sm,
    color: Colors.textSecondary,
  },
  footer: {
    marginTop: Layout.spacing.xl,
    gap: Layout.spacing.md,
  },
  footerNote: {
    fontSize: Layout.fontSize.sm,
    color: Colors.textTertiary,
    textAlign: 'center',
  },
});
