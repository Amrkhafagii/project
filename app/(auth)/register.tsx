import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Alert,
} from 'react-native';
import { router } from 'expo-router';
import { useAuth } from '@/hooks/useAuth';
import { UserRole, AuthFormData } from '@/types/auth';
import { Colors, Layout } from '@/constants';
import  Button  from '@/app/_components/common/Button';
import AuthForm from '@/app/_components/auth/AuthForm';
import AuthLayout from '@/app/_components/auth/AuthLayout';
import RoleSelector  from '@/app/_components/auth/RoleSelector';
import { validateAuthForm } from '@/utils/auth/validation';

export default function RegisterScreen() {
  const [formData, setFormData] = useState<AuthFormData>({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    phoneNumber: '',
  });
  const [selectedRole, setSelectedRole] = useState<UserRole>('customer');
  const [loading, setLoading] = useState(false);
  const { signUp } = useAuth();

  const handleRegister = useCallback(async () => {
    if (loading) return;

    const validation = validateAuthForm(formData, 'register');
    if (!validation.isValid) {
      Alert.alert('Error', validation.message);
      return;
    }

    setLoading(true);
    try {
      const { error } = await signUp(formData.email, formData.password!, {
        fullName: formData.fullName!,
        phoneNumber: formData.phoneNumber!,
        role: selectedRole,
      });
      
      if (error) {
        Alert.alert('Registration Failed', error.message || 'An error occurred');
      }
    } catch (error: any) {
      Alert.alert('Registration Failed', error.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  }, [formData, selectedRole, loading, signUp]);

  const handleSignIn = useCallback(() => {
    router.push('/(auth)/login');
  }, []);

  return (
    <AuthLayout
      title="Create Account"
      subtitle="Join our food delivery platform"
      scrollable
    >
      <AuthForm
        formData={formData}
        onFormChange={setFormData}
        onSubmit={handleRegister}
        loading={loading}
        mode="register"
      />

      <View style={styles.roleSection}>
        <Text style={styles.roleTitle}>Select Your Role</Text>
        <RoleSelector
          selectedRole={selectedRole}
          onRoleSelect={setSelectedRole}
          disabled={loading}
        />
      </View>

      <Button
        title={loading ? 'Creating Account...' : 'Create Account'}
        onPress={handleRegister}
        disabled={loading || !formData.email || !formData.password}
        loading={loading}
        fullWidth
        size="large"
        style={styles.button}
      />

      <View style={styles.footer}>
        <Text style={styles.footerText}>Already have an account? </Text>
        <Button
          title="Sign In"
          onPress={handleSignIn}
          variant="link"
          disabled={loading}
        />
      </View>
    </AuthLayout>
  );
}

const styles = StyleSheet.create({
  roleSection: {
    marginVertical: Layout.spacing.lg,
  },
  roleTitle: {
    fontSize: Layout.fontSize.lg,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: Layout.spacing.md,
  },
  button: {
    marginTop: Layout.spacing.md,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: Layout.spacing.lg,
  },
  footerText: {
    fontSize: Layout.fontSize.md,
    color: Colors.textSecondary,
  },
});
