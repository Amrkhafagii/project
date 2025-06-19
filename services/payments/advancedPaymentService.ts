import { useState, useCallback } from 'react';

interface PaymentMethod {
  id: string;
  type: 'card' | 'digital_wallet' | 'bank_transfer';
  brand: string;
  lastFour: string;
  expiryMonth?: number;
  expiryYear?: number;
  isDefault: boolean;
  isVerified: boolean;
  billingAddress?: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
}

interface Subscription {
  id: string;
  planType: 'basic' | 'pro' | 'ultimate';
  status: 'active' | 'cancelled' | 'suspended' | 'past_due';
  currentPeriodStart: string;
  currentPeriodEnd: string;
  pricePerMonth: number;
  mealsPerWeek: number;
  autoRenewal: boolean;
  trialEndsAt?: string;
  cancelledAt?: string;
  webhookEvents: WebhookEvent[];
}

interface Transaction {
  id: string;
  type: 'payment' | 'refund' | 'subscription' | 'dispute';
  amount: number;
  currency: string;
  status: 'pending' | 'completed' | 'failed' | 'cancelled' | 'disputed';
  orderId?: string;
  subscriptionId?: string;
  paymentMethodId: string;
  description: string;
  createdAt: string;
  completedAt?: string;
  failureReason?: string;
  refundReason?: string;
  disputeReason?: string;
  fees: {
    processing: number;
    platform: number;
    total: number;
  };
}

interface WebhookEvent {
  id: string;
  type: 'payment.completed' | 'subscription.renewed' | 'payment.failed' | 'dispute.created';
  data: any;
  timestamp: string;
  processed: boolean;
}

interface PaymentAnalytics {
  totalRevenue: number;
  successRate: number;
  averageOrderValue: number;
  monthlyRecurringRevenue: number;
  churnRate: number;
  lifetimeValue: number;
  paymentMethodDistribution: Record<string, number>;
  failureReasons: Record<string, number>;
}

interface RefundRequest {
  id: string;
  transactionId: string;
  amount: number;
  reason: 'customer_request' | 'order_issue' | 'quality_issue' | 'duplicate_charge' | 'fraudulent';
  status: 'pending' | 'approved' | 'denied' | 'processed';
  requestedBy: string;
  requestedAt: string;
  processedAt?: string;
  adminNotes?: string;
  customerReason?: string;
  evidence?: Array<{
    type: 'image' | 'document';
    url: string;
    description: string;
  }>;
}

interface SubscriptionWebhook {
  subscriptionId: string;
  eventType: 'created' | 'updated' | 'cancelled' | 'renewed' | 'payment_failed';
  data: Partial<Subscription>;
  timestamp: string;
}

export function useAdvancedPayments() {
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([
    {
      id: '1',
      type: 'card',
      brand: 'Visa',
      lastF our: '4242',
      expiryMonth: 12,
      expiryYear: 2027,
      isDefault: true,
      isVerified: true,
      billingAddress: {
        street: '123 Main St',
        city: 'New York',
        state: 'NY',
        zipCode: '10001',
        country: 'US',
      },
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
    autoRenewal: true,
    webhookEvents: [],
  });

  const [transactions, setTransactions] = useState<Transaction[]>([
    {
      id: 'txn_1',
      type: 'payment',
      amount: 42.50,
      currency: 'USD',
      status: 'completed',
      orderId: 'order_123',
      paymentMethodId: '1',
      description: 'Order #123 - Healthy Meal Delivery',
      createdAt: '2024-01-15T14:30:00Z',
      completedAt: '2024-01-15T14:30:05Z',
      fees: {
        processing: 1.53,
        platform: 0.85,
        total: 2.38,
      },
    },
  ]);

  const [refundRequests, setRefundRequests] = useState<RefundRequest[]>([]);
  const [processing, setProcessing] = useState(false);

  // Enhanced payment processing with retry logic and fraud detection
  const processPayment = useCallback(async (
    amount: number,
    paymentMethodId: string,
    orderId?: string,
    metadata?: Record<string, any>
  ): Promise<{ success: boolean; transactionId?: string; error?: string }> => {
    setProcessing(true);
    
    try {
      // Simulate fraud detection
      const fraudScore = Math.random();
      if (fraudScore > 0.95) {
        throw new Error('Payment flagged for potential fraud');
      }

      // Simulate payment processing with retry logic
      let attempts = 0;
      const maxAttempts = 3;
      
      while (attempts < maxAttempts) {
        attempts++;
        
        try {
          await new Promise(resolve => setTimeout(resolve, 1000 + attempts * 500));
          
          // Simulate random failures (10% chance)
          if (Math.random() < 0.1) {
            throw new Error('Temporary payment processing error');
          }
          
          break; // Success
        } catch (error) {
          if (attempts === maxAttempts) {
            throw error;
          }
          // Wait before retry
          await new Promise(resolve => setTimeout(resolve, 1000 * attempts));
        }
      }

      const transaction: Transaction = {
        id: `txn_${Date.now()}`,
        type: 'payment',
        amount,
        currency: 'USD',
        status: 'completed',
        orderId,
        paymentMethodId,
        description: orderId ? `Order #${orderId}` : 'Payment',
        createdAt: new Date().toISOString(),
        completedAt: new Date().toISOString(),
        fees: {
          processing: amount * 0.029 + 0.30, // 2.9% + $0.30
          platform: amount * 0.02, // 2% platform fee
          total: amount * 0.049 + 0.30,
        },
      };

      setTransactions(prev => [transaction, ...prev]);
      
      // Trigger webhook simulation
      simulateWebhook('payment.completed', { transaction });
      
      return {
        success: true,
        transactionId: transaction.id,
      };
    } catch (error) {
      const failedTransaction: Transaction = {
        id: `txn_${Date.now()}`,
        type: 'payment',
        amount,
        currency: 'USD',
        status: 'failed',
        orderId,
        paymentMethodId,
        description: orderId ? `Order #${orderId}` : 'Payment',
        createdAt: new Date().toISOString(),
        failureReason: error instanceof Error ? error.message : 'Unknown error',
        fees: { processing: 0, platform: 0, total: 0 },
      };

      setTransactions(prev => [failedTransaction, ...prev]);
      
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Payment failed',
      };
    } finally {
      setProcessing(false);
    }
  }, []);

  // Enhanced refund processing with approval workflow
  const processRefund = useCallback(async (
    transactionId: string,
    amount: number,
    reason: RefundRequest['reason'],
    customerReason?: string,
    evidence?: RefundRequest['evidence']
  ): Promise<{ success: boolean; refundId?: string; error?: string }> => {
    setProcessing(true);
    
    try {
      const transaction = transactions.find(t => t.id === transactionId);
      if (!transaction) {
        throw new Error('Transaction not found');
      }

      if (transaction.status !== 'completed') {
        throw new Error('Can only refund completed transactions');
      }

      if (amount > transaction.amount) {
        throw new Error('Refund amount cannot exceed original transaction amount');
      }

      // Create refund request
      const refundRequest: RefundRequest = {
        id: `refund_${Date.now()}`,
        transactionId,
        amount,
        reason,
        status: 'pending',
        requestedBy: 'customer', // In real app, this would be the user ID
        requestedAt: new Date().toISOString(),
        customerReason,
        evidence,
      };

      setRefundRequests(prev => [refundRequest, ...prev]);

      // Auto-approve certain types of refunds
      if (reason === 'duplicate_charge' || (reason === 'order_issue' && amount <= 50)) {
        await approveRefund(refundRequest.id);
      }

      return {
        success: true,
        refundId: refundRequest.id,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Refund failed',
      };
    } finally {
      setProcessing(false);
    }
  }, [transactions]);

  // Approve refund (admin function)
  const approveRefund = useCallback(async (refundId: string): Promise<void> => {
    const refundRequest = refundRequests.find(r => r.id === refundId);
    if (!refundRequest) return;

    // Process the actual refund
    await new Promise(resolve => setTimeout(resolve, 1500));

    const refundTransaction: Transaction = {
      id: `txn_${Date.now()}`,
      type: 'refund',
      amount: -refundRequest.amount,
      currency: 'USD',
      status: 'completed',
      paymentMethodId: transactions.find(t => t.id === refundRequest.transactionId)?.paymentMethodId || '',
      description: `Refund for transaction ${refundRequest.transactionId}`,
      createdAt: new Date().toISOString(),
      completedAt: new Date().toISOString(),
      refundReason: refundRequest.reason,
      fees: { processing: 0, platform: 0, total: 0 },
    };

    setTransactions(prev => [refundTransaction, ...prev]);
    setRefundRequests(prev => prev.map(r => 
      r.id === refundId 
        ? { ...r, status: 'processed' as const, processedAt: new Date().toISOString() }
        : r
    ));
  }, [refundRequests, transactions]);

  // Enhanced subscription management with webhooks
  const updateSubscription = useCallback(async (
    planType: 'basic' | 'pro' | 'ultimate',
    effectiveDate?: string
  ): Promise<{ success: boolean; error?: string }> => {
    setProcessing(true);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const planDetails = {
        basic: { price: 99, meals: 5 },
        pro: { price: 179, meals: 10 },
        ultimate: { price: 279, meals: 15 },
      };

      const updatedSubscription: Subscription = {
        ...subscription!,
        planType,
        pricePerMonth: planDetails[planType].price,
        mealsPerWeek: planDetails[planType].meals,
        currentPeriodEnd: effectiveDate || subscription!.currentPeriodEnd,
      };

      setSubscription(updatedSubscription);
      
      // Trigger webhook
      simulateSubscriptionWebhook(updatedSubscription.id, 'updated', updatedSubscription);
      
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update subscription',
      };
    } finally {
      setProcessing(false);
    }
  }, [subscription]);

  // Cancel subscription with retention logic
  const cancelSubscription = useCallback(async (
    reason?: string,
    feedback?: string
  ): Promise<{ success: boolean; retentionOffer?: any; error?: string }> => {
    setProcessing(true);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Retention logic - offer discount for certain cancellation reasons
      if (reason === 'too_expensive') {
        const retentionOffer = {
          type: 'discount',
          description: '25% off next 3 months',
          discountPercent: 25,
          durationMonths: 3,
        };
        
        return {
          success: false, // Don't cancel yet, show retention offer
          retentionOffer,
        };
      }
      
      if (subscription) {
        const cancelledSubscription = {
          ...subscription,
          status: 'cancelled' as const,
          cancelledAt: new Date().toISOString(),
          autoRenewal: false,
        };
        
        setSubscription(cancelledSubscription);
        
        // Trigger webhook
        simulateSubscriptionWebhook(subscription.id, 'cancelled', cancelledSubscription);
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
  }, [subscription]);

  // Payment analytics
  const getPaymentAnalytics = useCallback((): PaymentAnalytics => {
    const completedTransactions = transactions.filter(t => t.status === 'completed' && t.type === 'payment');
    const failedTransactions = transactions.filter(t => t.status === 'failed' && t.type === 'payment');
    
    const totalRevenue = completedTransactions.reduce((sum, t) => sum + t.amount, 0);
    const successRate = completedTransactions.length / (completedTransactions.length + failedTransactions.length) * 100;
    const averageOrderValue = totalRevenue / completedTransactions.length;
    
    const paymentMethodDistribution = paymentMethods.reduce((acc, pm) => {
      const count = completedTransactions.filter(t => t.paymentMethodId === pm.id).length;
      acc[pm.brand] = count;
      return acc;
    }, {} as Record<string, number>);
    
    const failureReasons = failedTransactions.reduce((acc, t) => {
      const reason = t.failureReason || 'Unknown';
      acc[reason] = (acc[reason] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      totalRevenue,
      successRate,
      averageOrderValue,
      monthlyRecurringRevenue: subscription ? subscription.pricePerMonth : 0,
      churnRate: 5.2, // Mock data
      lifetimeValue: 450, // Mock data
      paymentMethodDistribution,
      failureReasons,
    };
  }, [transactions, paymentMethods, subscription]);

  // Webhook simulation
  const simulateWebhook = useCallback((eventType: WebhookEvent['type'], data: any) => {
    const webhookEvent: WebhookEvent = {
      id: `webhook_${Date.now()}`,
      type: eventType,
      data,
      timestamp: new Date().toISOString(),
      processed: false,
    };

    if (subscription) {
      setSubscription(prev => prev ? {
        ...prev,
        webhookEvents: [webhookEvent, ...prev.webhookEvents],
      } : null);
    }

    // Simulate webhook processing
    setTimeout(() => {
      setSubscription(prev => prev ? {
        ...prev,
        webhookEvents: prev.webhookEvents.map(e => 
          e.id === webhookEvent.id ? { ...e, processed: true } : e
        ),
      } : null);
    }, 2000);
  }, [subscription]);

  const simulateSubscriptionWebhook = useCallback((
    subscriptionId: string,
    eventType: SubscriptionWebhook['eventType'],
    data: Partial<Subscription>
  ) => {
    const webhook: SubscriptionWebhook = {
      subscriptionId,
      eventType,
      data,
      timestamp: new Date().toISOString(),
    };

    // In a real app, this would be sent to your webhook endpoint
    console.log('Subscription webhook:', webhook);
  }, []);

  // PCI Compliance helpers
  const validateCardNumber = useCallback((cardNumber: string): boolean => {
    // Luhn algorithm implementation
    const digits = cardNumber.replace(/\D/g, '');
    let sum = 0;
    let isEven = false;
    
    for (let i = digits.length - 1; i >= 0; i--) {
      let digit = parseInt(digits[i]);
      
      if (isEven) {
        digit *= 2;
        if (digit > 9) {
          digit -= 9;
        }
      }
      
      sum += digit;
      isEven = !isEven;
    }
    
    return sum % 10 === 0;
  }, []);

  const maskCardNumber = useCallback((cardNumber: string): string => {
    const digits = cardNumber.replace(/\D/g, '');
    return `****-****-****-${digits.slice(-4)}`;
  }, []);

  return {
    // State
    paymentMethods,
    subscription,
    transactions,
    refundRequests,
    processing,
    
    // Payment operations
    processPayment,
    processRefund,
    approveRefund,
    
    // Subscription operations
    updateSubscription,
    cancelSubscription,
    
    // Analytics
    getPaymentAnalytics,
    
    // Utilities
    validateCardNumber,
    maskCardNumber,
    
    // Webhook simulation
    simulateWebhook,
    simulateSubscriptionWebhook,
  };
}
