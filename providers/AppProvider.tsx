import React, { ReactNode } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { LocationProvider } from '@/services/location/LocationProvider';
import { NotificationProvider } from '@/services/notifications/NotificationProvider';
import { PaymentProvider } from '@/services/payments/PaymentProvider';

interface AppProviderProps {
  children: ReactNode;
}

export function AppProvider({ children }: AppProviderProps) {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <LocationProvider>
          <NotificationProvider>
            <PaymentProvider>
              {children}
            </PaymentProvider>
          </NotificationProvider>
        </LocationProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
