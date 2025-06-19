import { useState } from 'react';

interface PaymentMethod {
  id: string;
  type: 'card' | 'digital_wallet' | 'bank_transfer';
  brand: string;
  lastFour: string;
  expiryMonth?: number;
  expiryYear?: number;
  isDefault: boolean;
}

interface Subscription {
  id: string;
  planType: 'basic' | 'pro' | 'ultimate';
  status: 'active' | 'cancelled' | 'suspended' | 'past_due';
  currentPeriodStart: string;
  currentPeriodEnd: string;
  pricePerMonth: number;
  mealsPerWeek: number;
}

export function usePayments() {
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([
    {
      id: '1',
      type: 'card',
      brand: 'Visa',
      lastFour: '4242',
      expiryMonth: 12,
      expiryYear: 2027,
      isDefault: true,
    },
  ]);

  const [subscription, setSubscription] = useState<Subscription | null>({
    id: 'sub_1',
    planType: 'pro',
    status: 'active',
    currentPeriodStart: '2024-01-01',
    currentPeriodEnd: '2024-02-01',
    pricePerMonth: 179,
    mealsPerWeek: 10,
  });

  const [processing, setProcessing] = useState(false);

  const processPayment = async (
    amount: number,
    paymentMethodId: string,
    orderId?: string
  ): Promise<{ success: boolean; paymentId?: string; error?: string }> => {
    setProcessing(true);
    
    try {
      // Simulate payment processing delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Mock payment processing logic
      const paymentMethod = paymentMethods.find(pm => pm.id === paymentMethodId);
      if (!paymentMethod) {
        throw new Error('Payment method not found');
      }

      // Simulate random payment failures (5% chance)
      if (Math.random() < 0.05) {
        throw new Error('Payment declined by bank');
      }

      const paymentId = `pay_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      return {
        success: true,
        paymentId,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Payment failed',
      };
    } finally {
      setProcessing(false);
    }
  };

  const processRefund = async (
    paymentId: string,
    amount: number,
    reason: string
  ): Promise<{ success: boolean; refundId?: string; error?: string }> => {
    setProcessing(true);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const refundId = `refund_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      return {
        success: true,
        refundId,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Refund failed',
      };
    } finally {
      setProcessing(false);
    }
  };

  const addPaymentMethod = async (
    cardNumber: string,
    expiryMonth: number,
    expiryYear: number,
    cvc: string,
    holderName: string
  ): Promise<{ success: boolean; paymentMethodId?: string; error?: string }> => {
    setProcessing(true);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Basic validation
      if (cardNumber.length < 13 || cardNumber.length > 19) {
        throw new Error('Invalid card number');
      }
      
      if (expiryMonth < 1 || expiryMonth > 12) {
        throw new Error('Invalid expiry month');
      }
      
      if (expiryYear < new Date().getFullYear()) {
        throw new Error('Card has expired');
      }

      const newPaymentMethod: PaymentMethod = {
        id: `pm_${Date.now()}`,
        type: 'card',
        brand: cardNumber.startsWith('4') ? 'Visa' : 'Mastercard',
        lastFour: cardNumber.slice(-4),
        expiryMonth,
        expiryYear,
        isDefault: paymentMethods.length === 0,
      };

      setPaymentMethods(prev => [...prev, newPaymentMethod]);
      
      return {
        success: true,
        paymentMethodId: newPaymentMethod.id,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to add payment method',
      };
    } finally {
      setProcessing(false);
    }
  };

  const removePaymentMethod = async (paymentMethodId: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const method = paymentMethods.find(pm => pm.id === paymentMethodId);
      if (!method) {
        throw new Error('Payment method not found');
      }

      if (method.isDefault && paymentMethods.length > 1) {
        throw new Error('Cannot remove default payment method. Set another as default first.');
      }

      setPaymentMethods(prev => prev.filter(pm => pm.id !== paymentMethodId));
      
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to remove payment method',
      };
    }
  };

  const setDefaultPaymentMethod = async (paymentMethodId: string): Promise<{ success: boolean; error?: string }> => {
    try {
      setPaymentMethods(prev => prev.map(pm => ({
        ...pm,
        isDefault: pm.id === paymentMethodId,
      })));
      
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to set default payment method',
      };
    }
  };

  const updateSubscription = async (
    planType: 'basic' | 'pro' | 'ultimate'
  ): Promise<{ success: boolean; error?: string }> => {
    setProcessing(true);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const planDetails = {
        basic: { price: 99, meals: 5 },
        pro: { price: 179, meals: 10 },
        ultimate: { price: 279, meals: 15 },
      };

      const newSubscription: Subscription = {
        id: subscription?.id || `sub_${Date.now()}`,
        planType,
        status: 'active',
        currentPeriodStart: new Date().toISOString().split('T')[0],
        currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        pricePerMonth: planDetails[planType].price,
        mealsPerWeek: planDetails[planType].meals,
      };

      setSubscription(newSubscription);
      
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update subscription',
      };
    } finally {
      setProcessing(false);
    }
  };

  const cancelSubscription = async (): Promise<{ success: boolean; error?: string }> => {
    setProcessing(true);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      if (subscription) {
        setSubscription({
          ...subscription,
          status: 'cancelled',
        });
      }
      
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to cancel subscription',
      };
    } finally {
      setProcessing(false);
    }
  };

  return {
    paymentMethods,
    subscription,
    processing,
    processPayment,
    processRefund,
    addPaymentMethod,
    removePaymentMethod,
    setDefaultPaymentMethod,
    updateSubscription,
    cancelSubscription,
  };
}
