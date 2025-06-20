import React from 'react';
import { Tabs } from 'expo-router';
import { AuthGuard } from '@/components/shared/AuthGuard';
import { TabBarIcon } from '@/app/_components/navigation/TabBarIcon';
import { Colors } from '@/constants';
import { Home, Search, ShoppingBag, Heart, User, Bike } from 'lucide-react-native';

export default function CustomerTabLayout() {
  return (
    <AuthGuard requiredRole="customer">
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: Colors.customer,
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
            title: 'Home',
            tabBarIcon: ({ color, focused }) => (
              <TabBarIcon Icon={Home} color={color} focused={focused} />
            ),
          }}
        />
        <Tabs.Screen
          name="search"
          options={{
            title: 'Search',
            tabBarIcon: ({ color, focused }) => (
              <TabBarIcon Icon={Search} color={color} focused={focused} />
            ),
          }}
        />
        <Tabs.Screen
          name="order-tracking"
          options={{
            title: 'Tracking',
            tabBarIcon: ({ color, focused }) => (
              <TabBarIcon Icon={Bike} color={color} focused={focused} />
            ),
            href: null, // Hide from tab bar, will be shown conditionally
          }}
        />
        <Tabs.Screen
          name="orders"
          options={{
            title: 'Orders',
            tabBarIcon: ({ color, focused }) => (
              <TabBarIcon Icon={ShoppingBag} color={color} focused={focused} />
            ),
          }}
        />
        <Tabs.Screen
          name="favorites"
          options={{
            title: 'Favorites',
            tabBarIcon: ({ color, focused }) => (
              <TabBarIcon Icon={Heart} color={color} focused={focused} />
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
