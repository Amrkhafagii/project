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
import { Colors, Layout } from '@/constants';
import { validateEmail, validateRequired } from '@/utils/validation';
import { Button } from '@/app/_components/common/Button';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn } = useAuth();

  const handleLogin = async () => {
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

    const passwordValidation = validateRequired(password, 'Password');
    if (!passwordValidation.isValid) {
      Alert.alert('Error', passwordValidation.message);
      return;
    }

    setLoading(true);
    try {
      await signIn(email, password);
      // Navigation will be handled by the index.tsx based on user role
    } catch (error) {
      Alert.alert('Login Failed', error instanceof Error ? error.message : 'An error occurred');
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
          <Text style={styles.title}>Welcome Back</Text>
          <Text style={styles.subtitle}>Sign in to your Zenith account</Text>

          <View style={styles.form}>
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

            <TouchableOpacity 
              style={styles.forgotPassword}
              onPress={() => router.push('/(auth)/forgot-password')}
              disabled={loading}
            >
              <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
            </TouchableOpacity>

            <Button
              title={loading ? 'Signing In...' : 'Sign In'}
              onPress={handleLogin}
              disabled={loading}
              loading={loading}
              fullWidth
              size="large"
              style={styles.loginButton}
            />
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>Don't have an account? </Text>
            <TouchableOpacity 
              onPress={() => router.push('/(auth)/register')}
              disabled={loading}
            >
              <Text style={styles.linkText}>Sign Up</Text>
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
    marginBottom: Layout.spacing.xxl,
    color: Colors.textSecondary,
  },
  form: {
    marginBottom: Layout.spacing.xl,
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    padding: 4,
    marginBottom: Layout.spacing.md,
  },
  forgotPasswordText: {
    fontSize: Layout.fontSize.sm,
    color: Colors.primary,
  },
  loginButton: {
    marginTop: Layout.spacing.sm,
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
