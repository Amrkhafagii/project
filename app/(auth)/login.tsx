import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { router } from 'expo-router';
import { useAuth } from '@/hooks/useAuth';
import { Colors, Layout } from '@/constants';
import  Button  from '@/app/_components/common/Button';
import AuthForm from '@/app/_components/auth/AuthForm';
import AuthLayout from '@/app/_components/auth/AuthLayout';
import { validateAuthForm } from '@/utils/auth/validation';
import { AuthFormData } from '@/types/auth';

export default function LoginScreen() {
  const [formData, setFormData] = useState<AuthFormData>({
    email: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const { signIn } = useAuth();

  const handleLogin = useCallback(async () => {
    if (loading) return;

    const validation = validateAuthForm(formData, 'login');
    if (!validation.isValid) {
      Alert.alert('Error', validation.message);
      return;
    }

    setLoading(true);
    try {
      await signIn(formData.email, formData.password);
      // Clear sensitive data
      setFormData({ email: '', password: '' });
    } catch (error) {
      console.log('Login error:', error instanceof Error ? error.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, [formData, loading, signIn]);

  const handleForgotPassword = useCallback(() => {
    router.push('/(auth)/forgot-password');
  }, []);

  const handleSignUp = useCallback(() => {
    router.push('/(auth)/register');
  }, []);

  return (
    <AuthLayout
      title="Welcome Back"
      subtitle="Sign in to your Zenith account"
    >
      <AuthForm
        formData={formData}
        onFormChange={setFormData}
        onSubmit={handleLogin}
        loading={loading}
        mode="login"
        onForgotPassword={handleForgotPassword}
      />

      <View style={styles.footer}>
        <Text style={styles.footerText}>Don't have an account? </Text>
        <Button
          title="Sign Up"
          onPress={handleSignUp}
          variant="link"
          disabled={loading}
        />
      </View>
    </AuthLayout>
  );
}

const styles = StyleSheet.create({
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
