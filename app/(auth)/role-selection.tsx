import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from 'react-native';
import { router } from 'expo-router';
import { useAuth } from '@/hooks/useAuth';
import { UserRole } from '@/types/auth';
import { Colors, Layout } from '@/constants';
import { RoleSelector } from '@/app/_components/auth/RoleSelector';
import { Button } from '@/app/_components/common/Button';

export default function RoleSelectionScreen() {
  const [selectedRole, setSelectedRole] = useState<UserRole>('customer');
  const [loading, setLoading] = useState(false);
  const { user, updateProfile } = useAuth();

  const handleContinue = async () => {
    if (!user) {
      Alert.alert('Error', 'No user found');
      return;
    }

    setLoading(true);
    try {
      await updateProfile({ role: selectedRole });
      // Navigation will be handled by the index.tsx based on updated role
      router.replace('/');
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to update role');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.content}>
          <View style={styles.headerContainer}>
            <Text style={styles.title}>Join Zenith!</Text>
            <Text style={styles.subtitle}>
              Select your role to customize your experience
            </Text>
            <View style={styles.avatarContainer}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>
                  {user?.email?.charAt(0).toUpperCase() || '?'}
                </Text>
              </View>
              <Text style={styles.emailText}>{user?.email}</Text>
            </View>
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
            
            <Text style={styles.footerNote} numberOfLines={2}>
              You can change this later in your profile settings
            </Text>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: Layout.spacing.lg,
    paddingVertical: Layout.spacing.lg,
  },
  headerContainer: {
    alignItems: 'center',
    marginBottom: Layout.spacing.xl,
    paddingTop: Layout.spacing.lg,
  },
  avatarContainer: {
    alignItems: 'center',
    marginTop: Layout.spacing.lg,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.primary + '20',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Layout.spacing.sm,
  },
  avatarText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: Colors.primary,
  },
  emailText: {
    fontSize: Layout.fontSize.sm,
    color: Colors.textSecondary,
  },
  title: {
    fontSize: Layout.fontSize.xxl,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: Layout.spacing.sm,
    color: Colors.text,
  },
  subtitle: {
    fontSize: Layout.fontSize.md,
    textAlign: 'center',
    color: Colors.textSecondary,
    lineHeight: 22,
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
