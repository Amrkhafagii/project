import React from 'react';
import {
  View,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Text,
} from 'react-native';
import { Colors, Layout } from '@/constants';
import { AuthFormData } from '@/types/auth';

interface AuthFormProps {
  formData: AuthFormData;
  onFormChange: (data: AuthFormData) => void;
  onSubmit: () => void;
  loading: boolean;
  mode: 'login' | 'register' | 'forgot-password';
  onForgotPassword?: () => void;
}

export default function AuthForm({
  formData,
  onFormChange,
  onSubmit,
  loading,
  mode,
  onForgotPassword,
}: AuthFormProps) {
  const updateField = (field: keyof AuthFormData, value: string) => {
    onFormChange({ ...formData, [field]: value });
  };

  return (
    <View style={styles.form}>
      {mode === 'register' && (
        <TextInput
          style={styles.input}
          placeholder="Full Name"
          value={formData.fullName || ''}
          onChangeText={(value) => updateField('fullName', value)}
          autoCapitalize="words"
          autoCorrect={false}
          editable={!loading}
        />
      )}

      <TextInput
        style={styles.input}
        placeholder="Email"
        value={formData.email}
        onChangeText={(value) => updateField('email', value)}
        keyboardType="email-address"
        autoCapitalize="none"
        autoCorrect={false}
        editable={!loading}
      />

      {mode === 'register' && (
        <TextInput
          style={styles.input}
          placeholder="Phone Number"
          value={formData.phoneNumber || ''}
          onChangeText={(value) => updateField('phoneNumber', value)}
          keyboardType="phone-pad"
          autoCorrect={false}
          editable={!loading}
        />
      )}

      {mode !== 'forgot-password' && (
        <>
          <TextInput
            style={styles.input}
            placeholder="Password"
            value={formData.password || ''}
            onChangeText={(value) => updateField('password', value)}
            secureTextEntry
            autoCapitalize="none"
            editable={!loading}
            onSubmitEditing={mode === 'login' ? onSubmit : undefined}
          />

          {mode === 'register' && (
            <TextInput
              style={styles.input}
              placeholder="Confirm Password"
              value={formData.confirmPassword || ''}
              onChangeText={(value) => updateField('confirmPassword', value)}
              secureTextEntry
              autoCapitalize="none"
              editable={!loading}
            />
          )}
        </>
      )}

      {mode === 'login' && onForgotPassword && (
        <TouchableOpacity 
          style={styles.forgotPassword}
          onPress={onForgotPassword}
          disabled={loading}
        >
          <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  form: {
    width: '100%',
    marginBottom: Layout.spacing.lg,
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
  forgotPassword: {
    alignSelf: 'flex-end',
    padding: 4,
    marginTop: -Layout.spacing.sm,
    marginBottom: Layout.spacing.md,
  },
  forgotPasswordText: {
    fontSize: Layout.fontSize.sm,
    color: Colors.primary,
  },
});
