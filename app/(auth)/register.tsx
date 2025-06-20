import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { router } from 'expo-router';
import { useAuth } from '@/hooks/useAuth';
import { UserRole } from '@/types/auth';
import { validateEmail, validatePassword, validateRequired, validateName } from '@/utils/validation';
import { Colors, Layout } from '@/constants';
import { Button } from '@/app/_components/common/Button';

export default function RegisterScreen() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { signUp } = useAuth();

  const roles: { value: UserRole; label: string; description: string }[] = [
    { value: 'customer', label: 'Customer', description: 'Order food from restaurants' },
    { value: 'restaurant', label: 'Restaurant', description: 'Manage your restaurant and orders' },
    { value: 'driver', label: 'Driver', description: 'Deliver orders to customers' },
  ];

  const handleRegister = async () => {
    // Validation
    const nameValidation = validateName(fullName);
    if (!nameValidation.isValid) {
      Alert.alert('Error', nameValidation.message);
      return;
    }

    const emailValidation = validateRequired(email, 'Email');
    if (!emailValidation.isValid) {
      Alert.alert('Error', emailValidation.message);
      return;
    }

    if (!validateEmail(email)) {
      Alert.alert('Error', 'Please enter a valid email address');
      return;
    }

    const passwordValidation = validatePassword(password);
    if (!passwordValidation.isValid) {
      Alert.alert('Error', passwordValidation.message);
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      // Sign up without role - role will be selected in the next step
      await signUp(email, password, {
        fullName, 
      });
      // Navigation will be handled by the index.tsx based on user role
    } catch (error: any) {
      Alert.alert('Registration Failed', error.message || 'An error occurred');
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
          <Text style={styles.title}>Create Account</Text>
          <Text style={styles.subtitle}>Join our food delivery platform</Text>

          <View style={styles.form}>
            <TextInput
              style={styles.input}
              placeholder="Full Name"
              value={fullName}
              onChangeText={setFullName}
              autoCapitalize="words"
              autoCorrect={false}
              editable={!loading}
            />

            <TextInput
              style={styles.input}
              placeholder="Email"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              editable={!loading}
            />

            <TextInput
              style={styles.input}
              placeholder="Password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              autoCapitalize="none"
              editable={!loading}
            />

            <TextInput
              style={styles.input}
              placeholder="Confirm Password"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry
              autoCapitalize="none"
              editable={!loading}
            />

            <Button
              title={loading ? 'Creating Account...' : 'Create Account'}
              onPress={handleRegister}
              disabled={loading}
              fullWidth
              size="large"
              loading={loading}
              style={styles.button}
            />
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>Already have an account? </Text>
            <TouchableOpacity 
              onPress={() => router.push('/(auth)/login')}
              disabled={loading}
            >
              <Text style={styles.linkText}>Sign In</Text>
            </TouchableOpacity>
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
    justifyContent: 'center',
    paddingHorizontal: Layout.spacing.lg,
    paddingVertical: Layout.spacing.xl,
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
    marginBottom: Layout.spacing.xl,
    color: Colors.textSecondary,
  },
  form: {
    marginBottom: Layout.spacing.lg,
    width: '100%',
    gap: Layout.spacing.md,
  input: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Layout.borderRadius.md,
    padding: Layout.spacing.md,
    fontSize: Layout.fontSize.md,
    marginBottom: Layout.spacing.md,
    backgroundColor: Colors.surface,
    color: Colors.text,
  },
  button: {
    marginTop: Layout.spacing.md,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  footerText: {
    fontSize: Layout.fontSize.md,
    color: Colors.textSecondary,
  },
  linkText: {
    fontSize: Layout.fontSize.md,
    color: Colors.primary,
    fontWeight: '600',
  },
});
