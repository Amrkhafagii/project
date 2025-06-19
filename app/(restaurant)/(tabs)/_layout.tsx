import React from 'react';
import { Tabs } from 'expo-router';
import { AuthGuard } from '@/components/shared/AuthGuard';
import { TabBarIcon } from '@/app/_components/navigation/TabBarIcon';
import { Colors } from '@/constants';
import { Home, ClipboardList, BarChart3, Settings, User, Tag } from 'lucide-react-native';

export default function RestaurantTabLayout() {
  return (
    <AuthGuard requiredRole="restaurant">
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: Colors.restaurant,
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
          name="orders"
          options={{
            title: 'Orders',
            headerShown: true,
            tabBarIcon: ({ color, focused }) => (
              <TabBarIcon Icon={ClipboardList} color={color} focused={focused} />
            ),
          }}
        />
        <Tabs.Screen
          name="analytics"
          options={{
            title: 'Analytics',
            headerShown: true,
            tabBarIcon: ({ color, focused }) => (
              <TabBarIcon Icon={BarChart3} color={color} focused={focused} />
            ),
          }}
        />
        <Tabs.Screen
          name="promotions"
          options={{
            title: 'Promotions',
            headerShown: true,
            tabBarIcon: ({ color, focused }) => (
              <TabBarIcon Icon={Tag} color={color} focused={focused} />
            ),
          }}
        />
        <Tabs.Screen
          name="menu"
          options={{
            title: 'Menu',
            headerShown: true,
            tabBarIcon: ({ color, focused }) => (
              <TabBarIcon Icon={Settings} color={color} focused={focused} />
            ),
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            title: 'Account',
            headerShown: true,
            tabBarIcon: ({ color, focused }) => (
              <TabBarIcon Icon={User} color={color} focused={focused} />
            ),
          }}
        />
      </Tabs>
    </AuthGuard>
  );
}
