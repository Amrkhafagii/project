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
import { validateEmail, validatePassword, validateRequired } from '@/utils/validation';
import { Colors, Layout } from '@/constants';
import { getRoleDisplayName } from '@/utils/helpers';

export default function RegisterScreen() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [selectedRole, setSelectedRole] = useState<UserRole>('customer');
  const [loading, setLoading] = useState(false);
  const { signUp } = useAuth();

  const roles: { value: UserRole; label: string; description: string }[] = [
    { value: 'customer', label: 'Customer', description: 'Order food from restaurants' },
    { value: 'restaurant', label: 'Restaurant', description: 'Manage your restaurant and orders' },
    { value: 'driver', label: 'Driver', description: 'Deliver orders to customers' },
  ];

  const handleRegister = async () => {
    // Validation
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
      await signUp(email, password, selectedRole, fullName);
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
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Full Name</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter your full name"
                value={fullName}
                onChangeText={setFullName}
                editable={!loading}
              />
            </View>

            <Text style={styles.sectionTitle}>Account Type</Text>
            <View style={styles.roleContainer}>
              {roles.map((role) => (
                <TouchableOpacity
                  key={role.value}
                  style={[
                    styles.roleOption,
                    selectedRole === role.value && styles.roleOptionSelected,
                  ]}
                  onPress={() => setSelectedRole(role.value)}
                  disabled={loading}
                >
                  <Text style={[
                    styles.roleLabel,
                    selectedRole === role.value && styles.roleLabelSelected,
                  ]}>
                    {role.label}
                  </Text>
                  <Text style={[
                    styles.roleDescription,
                    selectedRole === role.value && styles.roleDescriptionSelected,
                  ]}>
                    {role.description}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

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

            <TouchableOpacity
              style={[styles.button, loading && styles.buttonDisabled]}
              onPress={handleRegister}
              disabled={loading}
            >
              <Text style={styles.buttonText}>
                {loading ? 'Creating Account...' : 'Create Account'}
              </Text>
            </TouchableOpacity>
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
  },
  sectionTitle: {
    fontSize: Layout.fontSize.lg,
    fontWeight: '600',
    marginBottom: Layout.spacing.md,
    color: Colors.text,
  },
  roleContainer: {
    marginBottom: Layout.spacing.lg,
  },
  roleOption: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Layout.borderRadius.md,
    padding: Layout.spacing.md,
    marginBottom: Layout.spacing.sm,
    backgroundColor: Colors.surface,
  },
  roleOptionSelected: {
    borderColor: Colors.primary,
    backgroundColor: '#f0f8ff',
  },
  roleLabel: {
    fontSize: Layout.fontSize.md,
    fontWeight: '600',
    marginBottom: Layout.spacing.xs,
    color: Colors.text,
  },
  roleLabelSelected: {
    color: Colors.primary,
  },
  roleDescription: {
    fontSize: Layout.fontSize.sm,
    color: Colors.textSecondary,
  },
  roleDescriptionSelected: {
    color: '#0056b3',
  },
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
    backgroundColor: Colors.primary,
    borderRadius: Layout.borderRadius.md,
    padding: Layout.spacing.md,
    alignItems: 'center',
    marginTop: Layout.spacing.sm,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: Colors.white,
    fontSize: Layout.fontSize.md,
    fontWeight: '600',
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
