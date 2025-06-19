import React from 'react';
import { Tabs } from 'expo-router';
import { AuthGuard } from '@/components/shared/AuthGuard';
import { TabBarIcon } from '@/app/_components/navigation/TabBarIcon';
import { Colors } from '@/constants';
import { Home, Package, MapPin, DollarSign, User } from 'lucide-react-native';

export default function DriverTabLayout() {
  return (
    <AuthGuard requiredRole="driver">
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: Colors.driver,
          tabBarInactiveTintColor: Colors.textTertiary,
          tabBarStyle: {
            backgroundColor: Colors.background,
            borderTopWidth: 1,
            borderTopColor: Colors.border,
            paddingBottom: 8,
            paddingTop: 8,
            height: 88,
          },
          tabBarLabelStyle: {
            fontSize: 12,
            fontWeight: '500',
          },
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: 'Dashboard',
            tabBarIcon: ({ color, focused }) => (
              <TabBarIcon Icon={Home} color={color} focused={focused} />
            ),
          }}
        />
        <Tabs.Screen
          name="deliveries"
          options={{
            title: 'Deliveries',
            tabBarIcon: ({ color, focused }) => (
              <TabBarIcon Icon={Package} color={color} focused={focused} />
            ),
          }}
        />
        <Tabs.Screen
          name="map"
          options={{
            title: 'Map',
            tabBarIcon: ({ color, focused }) => (
              <TabBarIcon Icon={MapPin} color={color} focused={focused} />
            ),
          }}
        />
        <Tabs.Screen
          name="earnings"
          options={{
            title: 'Earnings',
            tabBarIcon: ({ color, focused }) => (
              <TabBarIcon Icon={DollarSign} color={color} focused={focused} />
            ),
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            title: 'Profile',
            tabBarIcon: ({ color, focused }) => (
              <TabBarIcon Icon={User} color={color} focused={focused} />
            ),
          }}
        />
      </Tabs>
    </AuthGuard>
  );
}
