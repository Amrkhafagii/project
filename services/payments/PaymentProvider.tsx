import React, { createContext, useContext, ReactNode } from 'react';

interface PaymentMethod {
  id: string;
  type: 'card' | 'paypal' | 'apple_pay' | 'google_pay';
  last4?: string;
  brand?: string;
  isDefault: boolean;
}

interface PaymentContextType {
  paymentMethods: PaymentMethod[];
  processPayment: (amount: number, paymentMethodId: string) => Promise<string>;
  addPaymentMethod: (paymentMethod: Omit<PaymentMethod, 'id'>) => Promise<PaymentMethod>;
  removePaymentMethod: (paymentMethodId: string) => Promise<void>;
  setDefaultPaymentMethod: (paymentMethodId: string) => Promise<void>;
}

const PaymentContext = createContext<PaymentContextType | undefined>(undefined);

interface PaymentProviderProps {
  children: ReactNode;
}

export function PaymentProvider({ children }: PaymentProviderProps) {
  // Mock payment methods for demo
  const paymentMethods: PaymentMethod[] = [
    {
      id: '1',
      type: 'card',
      last4: '4242',
      brand: 'visa',
      isDefault: true
    }
  ];

  const processPayment = async (amount: number, paymentMethodId: string): Promise<string> => {
    // Mock payment processing
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(`payment_${Date.now()}`);
      }, 2000);
    });
  };

  const addPaymentMethod = async (paymentMethod: Omit<PaymentMethod, 'id'>): Promise<PaymentMethod> => {
    // Mock adding payment method
    const newMethod: PaymentMethod = {
      ...paymentMethod,
      id: `pm_${Date.now()}`
    };
    return newMethod;
  };

  const removePaymentMethod = async (paymentMethodId: string): Promise<void> => {
    // Mock removing payment method
    console.log('Removing payment method:', paymentMethodId);
  };

  const setDefaultPaymentMethod = async (paymentMethodId: string): Promise<void> => {
    // Mock setting default payment method
    console.log('Setting default payment method:', paymentMethodId);
  };

  const value: PaymentContextType = {
    paymentMethods,
    processPayment,
    addPaymentMethod,
    removePaymentMethod,
    setDefaultPaymentMethod
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
