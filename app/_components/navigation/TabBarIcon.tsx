import React from 'react';
import { LucideIcon } from 'lucide-react-native';
import { Colors } from '@/constants';

interface TabBarIconProps {
  Icon: LucideIcon;
  color: string;
  focused: boolean;
  size?: number;
}

export function TabBarIcon({ Icon, color, focused, size = 24 }: TabBarIconProps) {
  return (
    <Icon 
      size={size} 
      color={focused ? color : Colors.textTertiary}
      strokeWidth={focused ? 2.5 : 2}
    />
  );
}

export default TabBarIcon;
