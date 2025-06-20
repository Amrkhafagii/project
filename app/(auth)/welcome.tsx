import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
  Dimensions,
} from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowRight } from 'lucide-react-native';
import { Colors, Layout } from '@/constants';

const { width } = Dimensions.get('window');

export default function WelcomeScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header Logo */}
        <View style={styles.logoContainer}>
          <Image
            source={{ uri: 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg' }}
            style={styles.logoImage}
            resizeMode="cover"
          />
          <View style={styles.logoOverlay}>
            <Text style={styles.appName}>Zenith</Text>
            <Text style={styles.appTagline}>Healthy Meals Delivered</Text>
          </View>
        </View>

        {/* Welcome Content */}
        <View style={styles.contentContainer}>
          <Text style={styles.heading}>
            Eat Healthy, Stay Fit, Live Better
          </Text>
          <Text style={styles.subheading}>
            Join our community and discover a new approach to food delivery and fitness tracking in one platform.
          </Text>

          {/* Feature Highlights */}
          <View style={styles.featuresContainer}>
            <View style={styles.featureItem}>
              <View style={styles.featureIconContainer}>
                <View style={[styles.featureIcon, { backgroundColor: Colors.customer + '20' }]}>
                  <Text style={[styles.featureIconText, { color: Colors.customer }]}>🍽️</Text>
                </View>
              </View>
              <View style={styles.featureTextContainer}>
                <Text style={styles.featureTitle}>Premium Meals</Text>
                <Text style={styles.featureDescription}>Nutritious, chef-crafted meals tailored to your fitness goals</Text>
              </View>
            </View>

            <View style={styles.featureItem}>
              <View style={styles.featureIconContainer}>
                <View style={[styles.featureIcon, { backgroundColor: Colors.restaurant + '20' }]}>
                  <Text style={[styles.featureIconText, { color: Colors.restaurant }]}>📊</Text>
                </View>
              </View>
              <View style={styles.featureTextContainer}>
                <Text style={styles.featureTitle}>Fitness Tracking</Text>
                <Text style={styles.featureDescription}>Track calories and macros with built-in nutrition guides</Text>
              </View>
            </View>

            <View style={styles.featureItem}>
              <View style={styles.featureIconContainer}>
                <View style={[styles.featureIcon, { backgroundColor: Colors.driver + '20' }]}>
                  <Text style={[styles.featureIconText, { color: Colors.driver }]}>🔔</Text>
                </View>
              </View>
              <View style={styles.featureTextContainer}>
                <Text style={styles.featureTitle}>Live Delivery</Text>
                <Text style={styles.featureDescription}>Real-time tracking and notifications for your orders</Text>
              </View>
            </View>
          </View>
        </View>

        {/* CTA Buttons */}
        <View style={styles.ctaContainer}>
          <TouchableOpacity 
            style={styles.registerButton}
            onPress={() => router.push('/(auth)/register')}
          >
            <Text style={styles.registerButtonText}>Create Account</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.loginButton}
            onPress={() => router.push('/(auth)/login')}
          >
            <Text style={styles.loginButtonText}>I already have an account</Text>
            <ArrowRight size={16} color={Colors.primary} />
          </TouchableOpacity>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            By continuing, you agree to our Terms and Privacy Policy
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 40,
  },
  logoContainer: {
    width: width,
    height: width * 0.6,
    position: 'relative',
    marginBottom: 24,
  },
  logoImage: {
    width: '100%',
    height: '100%',
  },
  logoOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    padding: 24,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  appName: {
    fontSize: 32,
    fontWeight: 'bold',
    color: Colors.white,
    marginBottom: 4,
  },
  appTagline: {
    fontSize: 18,
    color: Colors.white,
    opacity: 0.9,
  },
  contentContainer: {
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 24,
  },
  heading: {
    fontSize: Layout.fontSize.xxl,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 12,
    textAlign: 'center',
  },
  subheading: {
    fontSize: Layout.fontSize.md,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 32,
  },
  featuresContainer: {
    marginVertical: 24,
  },
  featureItem: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  featureIconContainer: {
    width: 60,
    marginRight: 16,
  },
  featureIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  featureIconText: {
    fontSize: 20,
  },
  featureTextContainer: {
    flex: 1,
  },
  featureTitle: {
    fontSize: Layout.fontSize.lg,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 4,
  },
  featureDescription: {
    fontSize: Layout.fontSize.sm,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  ctaContainer: {
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  registerButton: {
    backgroundColor: Colors.primary,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  registerButtonText: {
    color: Colors.white,
    fontSize: Layout.fontSize.lg,
    fontWeight: '600',
  },
  loginButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
  },
  loginButtonText: {
    color: Colors.primary,
    fontSize: Layout.fontSize.md,
    fontWeight: '500',
    marginRight: 8,
  },
  footer: {
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  footerText: {
    color: Colors.textTertiary,
    fontSize: Layout.fontSize.xs,
    textAlign: 'center',
  },
});