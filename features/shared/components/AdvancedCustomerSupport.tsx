import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { MessageCircle, Phone, Mail, HelpCircle } from 'lucide-react-native';
import { Card } from '@/components/ui';
import { COLORS, SPACING, TYPOGRAPHY, BORDER_RADIUS } from '@/utils/constants';

interface SupportOption {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  action: () => void;
}

export function AdvancedCustomerSupport() {
  const [selectedCategory, setSelectedCategory] = useState<string>('general');

  const supportOptions: SupportOption[] = [
    {
      id: 'chat',
      title: 'Live Chat',
      description: 'Chat with our support team',
      icon: <MessageCircle size={24} color={COLORS.primary} />,
      action: () => console.log('Open chat'),
    },
    {
      id: 'phone',
      title: 'Phone Support',
      description: 'Call us at 1-800-ZENITH',
      icon: <Phone size={24} color={COLORS.primary} />,
      action: () => console.log('Make call'),
    },
    {
      id: 'email',
      title: 'Email Support',
      description: 'Send us an email',
      icon: <Mail size={24} color={COLORS.primary} />,
      action: () => console.log('Send email'),
    },
    {
      id: 'faq',
      title: 'FAQ',
      description: 'Find answers to common questions',
      icon: <HelpCircle size={24} color={COLORS.primary} />,
      action: () => console.log('Open FAQ'),
    },
  ];

  const categories = [
    { id: 'general', title: 'General' },
    { id: 'orders', title: 'Orders' },
    { id: 'payments', title: 'Payments' },
    { id: 'account', title: 'Account' },
  ];

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Customer Support</Text>
      
      <View style={styles.categoryContainer}>
        {categories.map((category) => (
          <TouchableOpacity
            key={category.id}
            style={[
              styles.categoryButton,
              selectedCategory === category.id && styles.categoryButtonActive
            ]}
            onPress={() => setSelectedCategory(category.id)}
          >
            <Text style={[
              styles.categoryText,
              selectedCategory === category.id && styles.categoryTextActive
            ]}>
              {category.title}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.optionsContainer}>
        {supportOptions.map((option) => (
          <Card key={option.id} style={styles.optionCard}>
            <TouchableOpacity
              style={styles.optionContent}
              onPress={option.action}
            >
              <View style={styles.optionIcon}>
                {option.icon}
              </View>
              <View style={styles.optionText}>
                <Text style={styles.optionTitle}>{option.title}</Text>
                <Text style={styles.optionDescription}>{option.description}</Text>
              </View>
            </TouchableOpacity>
          </Card>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    padding: SPACING.md,
  },
  title: {
    fontSize: TYPOGRAPHY.sizes.xxl,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.text,
    marginBottom: SPACING.lg,
  },
  categoryContainer: {
    flexDirection: 'row',
    marginBottom: SPACING.lg,
  },
  categoryButton: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: COLORS.surface,
    marginRight: SPACING.sm,
  },
  categoryButtonActive: {
    backgroundColor: COLORS.primary,
  },
  categoryText: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: TYPOGRAPHY.weights.medium,
    color: COLORS.textSecondary,
  },
  categoryTextActive: {
    color: COLORS.surface,
  },
  optionsContainer: {
    gap: SPACING.md,
  },
  optionCard: {
    padding: 0,
  },
  optionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
  },
  optionIcon: {
    marginRight: SPACING.md,
  },
  optionText: {
    flex: 1,
  },
  optionTitle: {
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  optionDescription: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.textSecondary,
  },
});
