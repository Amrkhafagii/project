import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Alert,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Mail, ShieldCheck } from 'lucide-react-native';
import { Button } from '@/app/_components/common/Button';
import { Colors, Layout } from '@/constants';
import { validateEmail } from '@/utils/validation';
import { useAuth } from '@/hooks/useAuth';

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState('');
  const [resetSent, setResetSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const { resetPassword } = useAuth();

  const handleResetPassword = async () => {
    if (!validateEmail(email)) {
      Alert.alert('Error', 'Please enter a valid email address');
      return;
    }

    setLoading(true);
    try {
      await resetPassword(email);
      setResetSent(true);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to send reset email. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <View style={styles.content}>
          <TouchableOpacity 
            style={styles.backButton} 
            onPress={() => router.back()}
          >
            <ArrowLeft size={24} color={Colors.text} />
          </TouchableOpacity>
          
          <View style={styles.header}>
            {resetSent ? (
              <ShieldCheck size={64} color={Colors.success} style={styles.icon} />
            ) : (
              <Mail size={64} color={Colors.primary} style={styles.icon} />
            )}
            
            <Text style={styles.title}>
              {resetSent ? 'Check Your Email' : 'Reset Password'}
            </Text>
            
            <Text style={styles.subtitle}>
              {resetSent 
                ? 'We sent a password reset link to your email'
                : 'Enter your email address and we'll send you a link to reset your password'}
            </Text>
          </View>

          {!resetSent ? (
            <>
              <View style={styles.formGroup}>
                <Text style={styles.label}>Email Address</Text>
                <TextInput
                  style={styles.input}
                  placeholder="your@email.com"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoComplete="email"
                  editable={!loading}
                />
              </View>

              <Button
                title={loading ? 'Sending...' : 'Send Reset Link'}
                onPress={handleResetPassword}
                disabled={loading}
                loading={loading}
                fullWidth
              />
            </>
          ) : (
            <>
              <View style={styles.successMessage}>
                <Text style={styles.emailSent}>{email}</Text>
                <Text style={styles.instructions}>
                  Follow the link in the email to reset your password. If you don't see the email, check your spam folder.
                </Text>
              </View>

              <Button
                title="Back to Login"
                onPress={() => router.replace('/(auth)/login')}
                fullWidth
              />
              
              <TouchableOpacity 
                style={styles.resendLink}
                onPress={handleResetPassword}
              >
                <Text style={styles.resendText}>Didn't receive an email? Resend</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  keyboardView: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 40,
  },
  backButton: {
    alignSelf: 'flex-start',
    padding: 8,
    marginBottom: 16,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  icon: {
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 12,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    marginHorizontal: 24,
  },
  formGroup: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.text,
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    backgroundColor: Colors.white,
  },
  successMessage: {
    marginBottom: 32,
    padding: 24,
    backgroundColor: Colors.success + '10',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.success + '30',
  },
  emailSent: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.success,
    marginBottom: 12,
    textAlign: 'center',
  },
  instructions: {
    fontSize: 14,
    color: Colors.text,
    lineHeight: 22,
    textAlign: 'center',
  },
  resendLink: {
    alignItems: 'center',
    marginTop: 24,
    padding: 8,
  },
  resendText: {
    fontSize: 14,
    color: Colors.primary,
  },
});