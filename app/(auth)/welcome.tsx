import React, { useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
} from 'react-native';
import { router } from 'expo-router';
import { Colors, Layout } from '@/constants';
import { Button } from '@/app/_components/common/Button';
import { AuthLayout } from '@/app/_components/auth/AuthLayout';

export default function WelcomeScreen() {
  const handleGetStarted = useCallback(() => {
    router.push('/(auth)/register');
  }, []);

  const handleSignIn = useCallback(() => {
    router.push('/(auth)/login');
  }, []);

  return (
    <AuthLayout
      title="Welcome to Zenith"
      subtitle="Your favorite food, delivered fast"
    >
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg' }}
          style={styles.image}
          resizeMode="cover"
        />
      </View>

      <View style={styles.content}>
        <Text style={styles.description}>
          Order from the best restaurants in your area and get it delivered to your doorstep
        </Text>

        <View style={styles.buttonContainer}>
          <Button
            title="Get Started"
            onPress={handleGetStarted}
            fullWidth
            size="large"
            style={styles.button}
          />
          
          <Button
            title="Sign In"
            onPress={handleSignIn}
            variant="outline"
            fullWidth
            size="large"
          />
        </View>
      </View>
    </AuthLayout>
  );
}

const styles = StyleSheet.create({
  imageContainer: {
    width: '100%',
    height: 300,
    marginVertical: Layout.spacing.xl,
    borderRadius: Layout.borderRadius.lg,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  content: {
    flex: 1,
    justifyContent: 'space-between',
  },
  description: {
    fontSize: Layout.fontSize.lg,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: Layout.spacing.xl,
  },
  buttonContainer: {
    gap: Layout.spacing.md,
  },
  button: {
    marginBottom: Layout.spacing.sm,
  },
});
