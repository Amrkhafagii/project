import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Switch,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { router } from 'expo-router';
import { useAuth } from '@/hooks/useAuth';
import { Colors, Layout } from '@/constants';
import { Card } from '@/app/_components/common/Card';
import  Button  from '@/app/_components/common/Button';
import { 
  Bell, 
  Shield, 
  Globe, 
  Moon, 
  ChevronRight,
  LogOut,
  ArrowLeft 
} from 'lucide-react-native';

export default function SettingsScreen() {
  const { user, signOut } = useAuth();
  const [notifications, setNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [locationServices, setLocationServices] = useState(true);

  const handleSignOut = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Sign Out', 
          style: 'destructive',
          onPress: async () => {
            try {
              await signOut();
            } catch (error) {
              Alert.alert('Error', 'Failed to sign out');
            }
          }
        },
      ]
    );
  };

  const settingSections = [
    {
      title: 'Preferences',
      items: [
        {
          icon: Bell,
          title: 'Push Notifications',
          subtitle: 'Receive order updates and promotions',
          type: 'switch' as const,
          value: notifications,
          onToggle: setNotifications,
        },
        {
          icon: Moon,
          title: 'Dark Mode',
          subtitle: 'Switch to dark theme',
          type: 'switch' as const,
          value: darkMode,
          onToggle: setDarkMode,
        },
        {
          icon: Globe,
          title: 'Location Services',
          subtitle: 'Allow location access for better experience',
          type: 'switch' as const,
          value: locationServices,
          onToggle: setLocationServices,
        },
      ],
    },
    {
      title: 'Account',
      items: [
        {
          icon: Shield,
          title: 'Privacy & Security',
          subtitle: 'Manage your privacy settings',
          type: 'navigation' as const,
          onPress: () => Alert.alert('Coming Soon', 'Privacy settings will be available soon'),
        },
      ],
    },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={24} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Settings</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Card style={styles.profileCard}>
          <Text style={styles.profileName}>{user?.email}</Text>
          <Text style={styles.profileRole}>
            {user?.role === 'customer' ? 'Customer' : 
             user?.role === 'restaurant' ? 'Restaurant Owner' : 'Delivery Driver'}
          </Text>
        </Card>

        {settingSections.map((section, sectionIndex) => (
          <View key={sectionIndex} style={styles.section}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            <Card padding="sm">
              {section.items.map((item, itemIndex) => (
                <View key={itemIndex}>
                  <View style={styles.settingItem}>
                    <View style={styles.settingLeft}>
                      <View style={styles.settingIcon}>
                        <item.icon size={20} color={Colors.primary} />
                      </View>
                      <View style={styles.settingContent}>
                        <Text style={styles.settingTitle}>{item.title}</Text>
                        <Text style={styles.settingSubtitle}>{item.subtitle}</Text>
                      </View>
                    </View>
                    
                    <View style={styles.settingRight}>
                      {item.type === 'switch' ? (
                        <Switch
                          value={item.value}
                          onValueChange={item.onToggle}
                          trackColor={{ false: Colors.gray[300], true: Colors.primary + '40' }}
                          thumbColor={item.value ? Colors.primary : Colors.gray[400]}
                        />
                      ) : (
                        <TouchableOpacity onPress={item.onPress}>
                          <ChevronRight size={20} color={Colors.textTertiary} />
                        </TouchableOpacity>
                      )}
                    </View>
                  </View>
                  {itemIndex < section.items.length - 1 && <View style={styles.divider} />}
                </View>
              ))}
            </Card>
          </View>
        ))}

        <View style={styles.signOutSection}>
          <Button
            title="Sign Out"
            onPress={handleSignOut}
            variant="outline"
            fullWidth
            style={styles.signOutButton}
            textStyle={styles.signOutText}
          />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.surface,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Layout.spacing.lg,
    paddingTop: Layout.spacing.xxl,
    paddingBottom: Layout.spacing.md,
    backgroundColor: Colors.background,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  backButton: {
    padding: Layout.spacing.sm,
    marginLeft: -Layout.spacing.sm,
  },
  headerTitle: {
    flex: 1,
    fontSize: Layout.fontSize.lg,
    fontWeight: '600',
    color: Colors.text,
    textAlign: 'center',
  },
  headerSpacer: {
    width: 40,
  },
  content: {
    flex: 1,
    padding: Layout.spacing.lg,
  },
  profileCard: {
    alignItems: 'center',
    marginBottom: Layout.spacing.lg,
  },
  profileName: {
    fontSize: Layout.fontSize.lg,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: Layout.spacing.xs,
  },
  profileRole: {
    fontSize: Layout.fontSize.md,
    color: Colors.textSecondary,
  },
  section: {
    marginBottom: Layout.spacing.lg,
  },
  sectionTitle: {
    fontSize: Layout.fontSize.md,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: Layout.spacing.sm,
    marginLeft: Layout.spacing.sm,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Layout.spacing.md,
    paddingHorizontal: Layout.spacing.md,
  },
  settingLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.primary + '15',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Layout.spacing.md,
  },
  settingContent: {
    flex: 1,
  },
  settingTitle: {
    fontSize: Layout.fontSize.md,
    fontWeight: '500',
    color: Colors.text,
    marginBottom: Layout.spacing.xs,
  },
  settingSubtitle: {
    fontSize: Layout.fontSize.sm,
    color: Colors.textSecondary,
  },
  settingRight: {
    marginLeft: Layout.spacing.md,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.border,
    marginLeft: Layout.spacing.xxl + Layout.spacing.md,
  },
  signOutSection: {
    marginTop: Layout.spacing.xl,
    marginBottom: Layout.spacing.xxl,
  },
  signOutButton: {
    borderColor: Colors.error,
  },
  signOutText: {
    color: Colors.error,
  },
});
