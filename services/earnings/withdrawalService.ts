import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import * as Crypto from 'expo-crypto';
import { WithdrawalMethod, WithdrawalRequest, WithdrawalHistory, BankDetails, PayPalDetails, DigitalWalletDetails } from '@/types/earnings';

class WithdrawalService {
  private readonly MINIMUM_WITHDRAWAL = 10;
  private readonly STORAGE_KEYS = {
    METHODS: 'withdrawal_methods',
    HISTORY: 'withdrawal_history',
    ENCRYPTED_DETAILS: 'encrypted_payment_details',
  };

  async getWithdrawalMethods(userId: string): Promise<WithdrawalMethod[]> {
    try {
      let data: string | null = null;
      
      if (Platform.OS === 'web') {
        data = localStorage.getItem(`${this.STORAGE_KEYS.METHODS}_${userId}`);
      } else {
        data = await AsyncStorage.getItem(`${this.STORAGE_KEYS.METHODS}_${userId}`);
      }
      
      if (!data) return [];

      return JSON.parse(data);
    } catch (error) {
      console.error('Error getting withdrawal methods:', error);
      return [];
    }
  }

  async addWithdrawalMethod(
    userId: string,
    method: Omit<WithdrawalMethod, 'id' | 'isVerified'>
  ): Promise<WithdrawalMethod> {
    try {
      const existingMethods = await this.getWithdrawalMethods(userId);
      
      const newMethod: WithdrawalMethod = {
        ...method,
        id: await this.generateId(),
        isVerified: method.type === 'paypal', // PayPal can be instantly verified
      };

      // If this is the first method, make it default
      if (existingMethods.length === 0) {
        newMethod.isDefault = true;
      }

      const updatedMethods = [...existingMethods, newMethod];
      await this.storeEncryptedMethods(userId, updatedMethods);

      return newMethod;
    } catch (error) {
      console.error('Error adding withdrawal method:', error);
      throw new Error('Failed to add withdrawal method');
    }
  }

  async updateWithdrawalMethod(
    userId: string,
    methodId: string,
    updates: Partial<WithdrawalMethod>
  ): Promise<WithdrawalMethod> {
    try {
      const methods = await this.getWithdrawalMethods(userId);
      const methodIndex = methods.findIndex(m => m.id === methodId);
      
      if (methodIndex === -1) {
        throw new Error('Withdrawal method not found');
      }

      const updatedMethod = { ...methods[methodIndex], ...updates };
      methods[methodIndex] = updatedMethod;

      // If setting as default, remove default from others
      if (updates.isDefault) {
        methods.forEach((method, index) => {
          if (index !== methodIndex) {
            method.isDefault = false;
          }
        });
      }

      await this.storeEncryptedMethods(userId, methods);
      return updatedMethod;
    } catch (error) {
      console.error('Error updating withdrawal method:', error);
      throw new Error('Failed to update withdrawal method');
    }
  }

  async deleteWithdrawalMethod(userId: string, methodId: string): Promise<void> {
    try {
      const methods = await this.getWithdrawalMethods(userId);
      const filteredMethods = methods.filter(m => m.id !== methodId);
      
      // If deleted method was default, make first remaining method default
      if (filteredMethods.length > 0 && !filteredMethods.some(m => m.isDefault)) {
        filteredMethods[0].isDefault = true;
      }

      await this.storeEncryptedMethods(userId, filteredMethods);
    } catch (error) {
      console.error('Error deleting withdrawal method:', error);
      throw new Error('Failed to delete withdrawal method');
    }
  }

  async requestWithdrawal(
    userId: string,
    amount: number,
    methodId: string,
    availableBalance: number
  ): Promise<WithdrawalRequest> {
    try {
      // Validate withdrawal amount
      const validation = this.validateWithdrawalAmount(amount, availableBalance);
      if (!validation.isValid) {
        throw new Error(validation.errors.join(', '));
      }

      const methods = await this.getWithdrawalMethods(userId);
      const method = methods.find(m => m.id === methodId);
      
      if (!method) {
        throw new Error('Withdrawal method not found');
      }

      if (!method.isVerified) {
        throw new Error('Withdrawal method must be verified before use');
      }

      const fees = this.calculateFees(amount, method.type);
      const netAmount = amount - fees;

      const withdrawalRequest: WithdrawalRequest = {
        id: await this.generateId(),
        amount,
        method,
        status: 'pending',
        requestedAt: new Date(),
        fees,
        netAmount,
      };

      // Store withdrawal request
      await this.storeWithdrawalRequest(userId, withdrawalRequest);

      // In a real implementation, this would trigger the actual payment processing
      this.processWithdrawal(withdrawalRequest);

      return withdrawalRequest;
    } catch (error) {
      console.error('Error requesting withdrawal:', error);
      throw error;
    }
  }

  async getWithdrawalHistory(userId: string): Promise<WithdrawalHistory> {
    try {
      let data: string | null = null;
      
      if (Platform.OS === 'web') {
        data = localStorage.getItem(`${this.STORAGE_KEYS.HISTORY}_${userId}`);
      } else {
        data = await AsyncStorage.getItem(`${this.STORAGE_KEYS.HISTORY}_${userId}`);
      }
      
      if (!data) {
        return {
          requests: [],
          totalWithdrawn: 0,
          pendingAmount: 0,
          availableBalance: 0,
        };
      }

      const history = JSON.parse(data);
      
      // Convert date strings back to Date objects
      history.requests = history.requests.map((request: any) => ({
        ...request,
        requestedAt: new Date(request.requestedAt),
        processedAt: request.processedAt ? new Date(request.processedAt) : undefined,
      }));

      return history;
    } catch (error) {
      console.error('Error getting withdrawal history:', error);
      return {
        requests: [],
        totalWithdrawn: 0,
        pendingAmount: 0,
        availableBalance: 0,
      };
    }
  }

  validateWithdrawalAmount(amount: number, availableBalance: number): {
    isValid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    if (amount < this.MINIMUM_WITHDRAWAL) {
      errors.push(`Minimum withdrawal amount is $${this.MINIMUM_WITHDRAWAL}`);
    }

    if (amount > availableBalance) {
      errors.push('Insufficient balance for withdrawal');
    }

    if (amount <= 0) {
      errors.push('Withdrawal amount must be greater than zero');
    }

    if (!Number.isFinite(amount)) {
      errors.push('Invalid withdrawal amount');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  validateBankDetails(details: BankDetails): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!details.accountNumber || details.accountNumber.length < 8) {
      errors.push('Valid account number is required');
    }

    if (!details.routingNumber || details.routingNumber.length !== 9) {
      errors.push('Valid 9-digit routing number is required');
    }

    if (!details.accountHolderName || details.accountHolderName.trim().length < 2) {
      errors.push('Account holder name is required');
    }

    if (!details.bankName || details.bankName.trim().length < 2) {
      errors.push('Bank name is required');
    }

    if (!['checking', 'savings'].includes(details.accountType)) {
      errors.push('Valid account type is required');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  validatePayPalDetails(details: PayPalDetails): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!details.email || !emailRegex.test(details.email)) {
      errors.push('Valid PayPal email address is required');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  private calculateFees(amount: number, methodType: WithdrawalMethod['type']): number {
    switch (methodType) {
      case 'bank_transfer':
        return 0; // No fees for bank transfer
      case 'paypal':
        return Math.max(0.30, amount * 0.029); // PayPal fees: 2.9% + $0.30
      case 'digital_wallet':
        return amount * 0.015; // 1.5% for digital wallets
      default:
        return 0;
    }
  }

  private async processWithdrawal(request: WithdrawalRequest): Promise<void> {
    // Simulate processing delay
    setTimeout(async () => {
      try {
        // In a real implementation, this would integrate with payment processors
        const updatedRequest = {
          ...request,
          status: 'completed' as const,
          processedAt: new Date(),
          transactionId: `TXN_${await this.generateId()}`,
        };

        // Update the stored request
        // This would typically be handled by a backend service
        console.log('Withdrawal processed:', updatedRequest);
      } catch (error) {
        console.error('Error processing withdrawal:', error);
      }
    }, 2000);
  }

  private async storeEncryptedMethods(userId: string, methods: WithdrawalMethod[]): Promise<void> {
    try {
      const data = JSON.stringify(methods);
      if (Platform.OS === 'web') {
        localStorage.setItem(`${this.STORAGE_KEYS.METHODS}_${userId}`, data);
      } else {
        await AsyncStorage.setItem(`${this.STORAGE_KEYS.METHODS}_${userId}`, data);
      }
    } catch (error) {
      console.error('Error storing withdrawal methods:', error);
      throw new Error('Failed to store withdrawal methods securely');
    }
  }

  private async storeWithdrawalRequest(userId: string, request: WithdrawalRequest): Promise<void> {
    try {
      const history = await this.getWithdrawalHistory(userId);
      history.requests.unshift(request);
      history.pendingAmount += request.amount;

      const data = JSON.stringify(history);
      if (Platform.OS === 'web') {
        localStorage.setItem(`${this.STORAGE_KEYS.HISTORY}_${userId}`, data);
      } else {
        await AsyncStorage.setItem(`${this.STORAGE_KEYS.HISTORY}_${userId}`, data);
      }
    } catch (error) {
      console.error('Error storing withdrawal request:', error);
      throw new Error('Failed to store withdrawal request');
    }
  }

  private async generateId(): Promise<string> {
    const randomBytes = await Crypto.getRandomBytesAsync(16);
    return Array.from(randomBytes, byte => byte.toString(16).padStart(2, '0')).join('');
  }

  private async encryptData(data: string): Promise<string> {
    try {
      const digest = await Crypto.digestStringAsync(
        Crypto.CryptoDigestAlgorithm.SHA256,
        data,
        { encoding: Crypto.CryptoEncoding.HEX }
      );
      return Buffer.from(data).toString('base64') + '.' + digest;
    } catch (error) {
      console.error('Error encrypting data:', error);
      throw new Error('Encryption failed');
    }
  }

  private async decryptData(encryptedData: string): Promise<string> {
    try {
      const [data] = encryptedData.split('.');
      return Buffer.from(data, 'base64').toString('utf-8');
    } catch (error) {
      console.error('Error decrypting data:', error);
      throw new Error('Decryption failed');
    }
  }
}

export const withdrawalService = new WithdrawalService();
