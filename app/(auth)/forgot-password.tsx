import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Alert,
} from 'react-native';
import { router } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext'
import { Colors, Layout } from '@/constants';
import  Button  from '@/app/_components/common/Button';
import AuthForm from '@/app/_components/auth/AuthForm';
import AuthLayout from '@/app/_components/auth/AuthLayout';
import { validateAuthForm } from '@/utils/auth/validation';
import { AuthFormData } from '@/types/auth';

export default function ForgotPasswordScreen() {
  const [formData, setFormData] = useState<AuthFormData>({
    email: '',
  });
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const { resetPassword } = useAuth();

  const handleResetPassword = useCallback(async () => {
    if (loading) return;

    const validation = validateAuthForm(formData, 'forgot-password');
    if (!validation.isValid) {
      Alert.alert('Error', validation.message);
      return;
    }

    setLoading(true);
    try {
      await resetPassword(formData.email);
      setEmailSent(true);
      Alert.alert(
        'Check Your Email',
        'We have sent you a password reset link. Please check your email.',
        [{ text: 'OK', onPress: () => router.back() }]
      );
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to send reset email');
    } finally {
      setLoading(false);
    }
  }, [formData, loading, resetPassword]);

  const handleBackToLogin = useCallback(() => {
    router.back();
  }, []);

  if (emailSent) {
    return (
      <AuthLayout
        title="Email Sent!"
        subtitle="Check your inbox for the password reset link"
      >
        <View style={styles.successContainer}>
          <Text style={styles.successIcon}>📧</Text>
          <Text style={styles.successText}>
            We've sent a password reset link to {formData.email}
          </Text>
          <Button
            title="Back to Login"
            onPress={handleBackToLogin}
            fullWidth
            size="large"
            style={styles.button}
          />
        </View>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      title="Forgot Password?"
      subtitle="Enter your email and we'll send you a reset link"
    >
      <AuthForm
        formData={formData}
        onFormChange={setFormData}
        onSubmit={handleResetPassword}
        loading={loading}
        mode="forgot-password"
      />

      <Button
        title={loading ? 'Sending...' : 'Send Reset Link'}
        onPress={handleResetPassword}
        disabled={loading || !formData.email}
        loading={loading}
        fullWidth
        size="large"
        style={styles.button}
      />

      <View style={styles.footer}>
        <Text style={styles.footerText}>Remember your password? </Text>
        <Button
          title="Sign In"
          onPress={handleBackToLogin}
          variant="link"
          disabled={loading}
        />
      </View>
    </AuthLayout>
  );
}

const styles = StyleSheet.create({
  successContainer: {
    alignItems: 'center',
    paddingVertical: Layout.spacing.xl,
  },
  successIcon: {
    fontSize: 64,
    marginBottom: Layout.spacing.lg,
  },
  successText: {
    fontSize: Layout.fontSize.md,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: Layout.spacing.xl,
    paddingHorizontal: Layout.spacing.lg,
  },
  button: {
    marginTop: Layout.spacing.lg,
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
