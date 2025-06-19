import React from 'react';
import { LucideIcon } from 'lucide-react-native';

interface TabBarIconProps {
  Icon: LucideIcon;
  color: string;
  size?: number;
  focused?: boolean;
}

export function TabBarIcon({ Icon, color, size = 24, focused }: TabBarIconProps) {
  return (
    <Icon 
      size={size} 
      color={color}
      strokeWidth={focused ? 2.5 : 2}
    />
  );
}
