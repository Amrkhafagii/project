import React, { createContext, useContext, ReactNode } from 'react';

interface PaymentContextType {
  processPayment: (amount: number, method: string) => Promise<{ success: boolean; error?: string }>;
  getPaymentMethods: () => Promise<any[]>;
  addPaymentMethod: (method: any) => Promise<{ success: boolean; error?: string }>;
}

const PaymentContext = createContext<PaymentContextType | undefined>(undefined);

interface PaymentProviderProps {
  children: ReactNode;
}

export function PaymentProvider({ children }: PaymentProviderProps) {
  const processPayment = async (amount: number, method: string) => {
    // Mock payment processing
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      return { success: true };
    } catch (error) {
      return { success: false, error: 'Payment failed' };
    }
  };

  const getPaymentMethods = async () => {
    // Mock payment methods
    return [
      { id: '1', type: 'card', last4: '4242', brand: 'visa' },
      { id: '2', type: 'card', last4: '5555', brand: 'mastercard' },
    ];
  };

  const addPaymentMethod = async (method: any) => {
    // Mock adding payment method
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      return { success: true };
    } catch (error) {
      return { success: false, error: 'Failed to add payment method' };
    }
  };

  const value: PaymentContextType = {
    processPayment,
    getPaymentMethods,
    addPaymentMethod,
  };

  return (
    <PaymentContext.Provider value={value}>
      {children}
    </PaymentContext.Provider>
  );
}

export function usePayments() {
  const context = useContext(PaymentContext);
  if (context === undefined) {
    throw new Error('usePayments must be used within a PaymentProvider');
  }
  return context;
}
