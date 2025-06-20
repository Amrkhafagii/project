import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { X, DollarSign, CreditCard, Building, Smartphone, Check, TriangleAlert as AlertTriangle } from 'lucide-react-native';
import { withdrawalService } from '@/services/earnings/withdrawalService';
import { WithdrawalMethod, BankDetails, PayPalDetails, DigitalWalletDetails } from '@/types/earnings';

interface WithdrawalModalProps {
  visible: boolean;
  onClose: () => void;
  availableBalance: number;
  userId: string;
  onWithdrawalRequested: () => void;
}

export default function WithdrawalModal({
  visible,
  onClose,
  availableBalance,
  userId,
  onWithdrawalRequested,
}: WithdrawalModalProps) {
  const [currentStep, setCurrentStep] = useState<'amount' | 'method' | 'details' | 'confirm'>('amount');
  const [withdrawalAmount, setWithdrawalAmount] = useState<string>('');
  const [selectedMethod, setSelectedMethod] = useState<WithdrawalMethod | null>(null);
  const [withdrawalMethods, setWithdrawalMethods] = useState<WithdrawalMethod[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);

  // Form states for new payment methods
  const [bankDetails, setBankDetails] = useState<BankDetails>({
    accountNumber: '',
    routingNumber: '',
    accountHolderName: '',
    bankName: '',
    accountType: 'checking',
  });

  const [paypalDetails, setPaypalDetails] = useState<PayPalDetails>({
    email: '',
    isVerified: false,
  });

  const [digitalWalletDetails, setDigitalWalletDetails] = useState<DigitalWalletDetails>({
    walletType: 'venmo',
    identifier: '',
    displayName: '',
  });

  useEffect(() => {
    if (visible) {
      loadWithdrawalMethods();
      resetForm();
    }
  }, [visible]);

  const loadWithdrawalMethods = async () => {
    try {
      const methods = await withdrawalService.getWithdrawalMethods(userId);
      setWithdrawalMethods(methods);
    } catch (error) {
      console.error('Error loading withdrawal methods:', error);
    }
  };

  const resetForm = () => {
    setCurrentStep('amount');
    setWithdrawalAmount('');
    setSelectedMethod(null);
    setErrors([]);
    setBankDetails({
      accountNumber: '',
      routingNumber: '',
      accountHolderName: '',
      bankName: '',
      accountType: 'checking',
    });
    setPaypalDetails({
      email: '',
      isVerified: false,
    });
    setDigitalWalletDetails({
      walletType: 'venmo',
      identifier: '',
      displayName: '',
    });
  };

  const validateAmount = () => {
    const amount = parseFloat(withdrawalAmount);
    const validation = withdrawalService.validateWithdrawalAmount(amount, availableBalance);
    
    if (!validation.isValid) {
      setErrors(validation.errors);
      return false;
    }
    
    setErrors([]);
    return true;
  };

  const handleAmountNext = () => {
    if (validateAmount()) {
      setCurrentStep('method');
    }
  };

  const handleMethodSelect = (method: WithdrawalMethod) => {
    setSelectedMethod(method);
    setCurrentStep('confirm');
  };

  const handleAddNewMethod = (type: WithdrawalMethod['type']) => {
    setSelectedMethod({
      id: 'new',
      type,
      name: '',
      details: type === 'bank_transfer' ? bankDetails : type === 'paypal' ? paypalDetails : digitalWalletDetails,
      isDefault: false,
      isVerified: false,
      processingTime: getProcessingTime(type),
      fees: 0,
    });
    setCurrentStep('details');
  };

  const getProcessingTime = (type: WithdrawalMethod['type']) => {
    switch (type) {
      case 'bank_transfer':
        return '1-3 business days';
      case 'paypal':
        return 'Instant';
      case 'digital_wallet':
        return 'Instant';
      default:
        return '1-3 business days';
    }
  };

  const validatePaymentDetails = () => {
    if (!selectedMethod) return false;

    let validation;
    switch (selectedMethod.type) {
      case 'bank_transfer':
        validation = withdrawalService.validateBankDetails(bankDetails);
        break;
      case 'paypal':
        validation = withdrawalService.validatePayPalDetails(paypalDetails);
        break;
      case 'digital_wallet':
        validation = { isValid: true, errors: [] }; // Simplified validation
        break;
      default:
        validation = { isValid: false, errors: ['Invalid payment method'] };
    }

    if (!validation.isValid) {
      setErrors(validation.errors);
      return false;
    }

    setErrors([]);
    return true;
  };

  const handleDetailsNext = async () => {
    if (!validatePaymentDetails() || !selectedMethod) return;

    try {
      setIsLoading(true);
      
      // Add new payment method
      const newMethod = await withdrawalService.addWithdrawalMethod(
        userId,
        {
          type: selectedMethod.type,
          name: selectedMethod.type === 'bank_transfer' 
            ? `${bankDetails.bankName} ****${bankDetails.accountNumber.slice(-4)}`
            : selectedMethod.type === 'paypal'
            ? paypalDetails.email
            : `${digitalWalletDetails.walletType} - ${digitalWalletDetails.displayName}`,
          details: selectedMethod.type === 'bank_transfer' 
            ? bankDetails 
            : selectedMethod.type === 'paypal' 
            ? paypalDetails 
            : digitalWalletDetails,
          isDefault: withdrawalMethods.length === 0,
          processingTime: selectedMethod.processingTime,
          fees: 0,
        }
      );

      setSelectedMethod(newMethod);
      setCurrentStep('confirm');
    } catch (error) {
      console.error('Error adding payment method:', error);
      Alert.alert('Error', 'Failed to add payment method');
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirmWithdrawal = async () => {
    if (!selectedMethod) return;

    try {
      setIsLoading(true);
      
      const amount = parseFloat(withdrawalAmount);
      await withdrawalService.requestWithdrawal(
        userId,
        amount,
        selectedMethod.id,
        availableBalance
      );

      Alert.alert(
        'Withdrawal Requested',
        `Your withdrawal of $${amount.toFixed(2)} has been requested. Processing time: ${selectedMethod.processingTime}`,
        [
          {
            text: 'OK',
            onPress: () => {
              onWithdrawalRequested();
              onClose();
            },
          },
        ]
      );
    } catch (error) {
      console.error('Error requesting withdrawal:', error);
      Alert.alert('Error', error instanceof Error ? error.message : 'Failed to request withdrawal');
    } finally {
      setIsLoading(false);
    }
  };

  const renderAmountStep = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Withdrawal Amount</Text>
      <Text style={styles.stepDescription}>
        Enter the amount you'd like to withdraw
      </Text>

      <View style={styles.balanceInfo}>
        <Text style={styles.balanceLabel}>Available Balance</Text>
        <Text style={styles.balanceAmount}>${availableBalance.toFixed(2)}</Text>
      </View>

      <View style={styles.inputContainer}>
        <DollarSign size={20} color="#6B7280" style={styles.inputIcon} />
        <TextInput
          style={styles.amountInput}
          value={withdrawalAmount}
          onChangeText={setWithdrawalAmount}
          placeholder="0.00"
          keyboardType="decimal-pad"
          maxLength={10}
        />
      </View>

      {errors.length > 0 && (
        <View style={styles.errorContainer}>
          {errors.map((error, index) => (
            <Text key={index} style={styles.errorText}>• {error}</Text>
          ))}
        </View>
      )}

      <Text style={styles.minimumNote}>
        Minimum withdrawal amount: $10.00
      </Text>

      <TouchableOpacity
        style={[styles.nextButton, !withdrawalAmount && styles.disabledButton]}
        onPress={handleAmountNext}
        disabled={!withdrawalAmount}
      >
        <Text style={styles.nextButtonText}>Next</Text>
      </TouchableOpacity>
    </View>
  );

  const renderMethodStep = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Payment Method</Text>
      <Text style={styles.stepDescription}>
        Choose how you'd like to receive your withdrawal
      </Text>

      <ScrollView style={styles.methodsList}>
        {withdrawalMethods.map((method) => (
          <TouchableOpacity
            key={method.id}
            style={styles.methodCard}
            onPress={() => handleMethodSelect(method)}
          >
            <View style={styles.methodIcon}>
              {method.type === 'bank_transfer' && <Building size={24} color="#3B82F6" />}
              {method.type === 'paypal' && <CreditCard size={24} color="#0070BA" />}
              {method.type === 'digital_wallet' && <Smartphone size={24} color="#10B981" />}
            </View>
            
            <View style={styles.methodInfo}>
              <Text style={styles.methodName}>{method.name}</Text>
              <Text style={styles.methodProcessing}>{method.processingTime}</Text>
              {method.fees > 0 && (
                <Text style={styles.methodFees}>Fee: ${method.fees.toFixed(2)}</Text>
              )}
            </View>

            {method.isDefault && (
              <View style={styles.defaultBadge}>
                <Text style={styles.defaultText}>Default</Text>
              </View>
            )}
          </TouchableOpacity>
        ))}

        {/* Add New Method Options */}
        <View style={styles.addMethodSection}>
          <Text style={styles.addMethodTitle}>Add New Payment Method</Text>
          
          <TouchableOpacity
            style={styles.addMethodCard}
            onPress={() => handleAddNewMethod('bank_transfer')}
          >
            <Building size={24} color="#3B82F6" />
            <View style={styles.addMethodInfo}>
              <Text style={styles.addMethodName}>Bank Transfer</Text>
              <Text style={styles.addMethodDescription}>1-3 business days • No fees</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.addMethodCard}
            onPress={() => handleAddNewMethod('paypal')}
          >
            <CreditCard size={24} color="#0070BA" />
            <View style={styles.addMethodInfo}>
              <Text style={styles.addMethodName}>PayPal</Text>
              <Text style={styles.addMethodDescription}>Instant • 2.9% + $0.30 fee</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.addMethodCard}
            onPress={() => handleAddNewMethod('digital_wallet')}
          >
            <Smartphone size={24} color="#10B981" />
            <View style={styles.addMethodInfo}>
              <Text style={styles.addMethodName}>Digital Wallet</Text>
              <Text style={styles.addMethodDescription}>Instant • 1.5% fee</Text>
            </View>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );

  const renderDetailsStep = () => {
    if (!selectedMethod) return null;

    return (
      <View style={styles.stepContainer}>
        <Text style={styles.stepTitle}>Payment Details</Text>
        <Text style={styles.stepDescription}>
          Enter your {selectedMethod.type.replace('_', ' ')} information
        </Text>

        <ScrollView style={styles.detailsForm}>
          {selectedMethod.type === 'bank_transfer' && (
            <>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Account Holder Name</Text>
                <TextInput
                  style={styles.textInput}
                  value={bankDetails.accountHolderName}
                  onChangeText={(text) => setBankDetails(prev => ({ ...prev, accountHolderName: text }))}
                  placeholder="Full name on account"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Bank Name</Text>
                <TextInput
                  style={styles.textInput}
                  value={bankDetails.bankName}
                  onChangeText={(text) => setBankDetails(prev => ({ ...prev, bankName: text }))}
                  placeholder="Bank name"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Account Number</Text>
                <TextInput
                  style={styles.textInput}
                  value={bankDetails.accountNumber}
                  onChangeText={(text) => setBankDetails(prev => ({ ...prev, accountNumber: text }))}
                  placeholder="Account number"
                  keyboardType="numeric"
                  secureTextEntry
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Routing Number</Text>
                <TextInput
                  style={styles.textInput}
                  value={bankDetails.routingNumber}
                  onChangeText={(text) => setBankDetails(prev => ({ ...prev, routingNumber: text }))}
                  placeholder="9-digit routing number"
                  keyboardType="numeric"
                  maxLength={9}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Account Type</Text>
                <View style={styles.radioGroup}>
                  <TouchableOpacity
                    style={styles.radioOption}
                    onPress={() => setBankDetails(prev => ({ ...prev, accountType: 'checking' }))}
                  >
                    <View style={[styles.radio, bankDetails.accountType === 'checking' && styles.radioSelected]} />
                    <Text style={styles.radioText}>Checking</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.radioOption}
                    onPress={() => setBankDetails(prev => ({ ...prev, accountType: 'savings' }))}
                  >
                    <View style={[styles.radio, bankDetails.accountType === 'savings' && styles.radioSelected]} />
                    <Text style={styles.radioText}>Savings</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </>
          )}

          {selectedMethod.type === 'paypal' && (
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>PayPal Email</Text>
              <TextInput
                style={styles.textInput}
                value={paypalDetails.email}
                onChangeText={(text) => setPaypalDetails(prev => ({ ...prev, email: text }))}
                placeholder="your@email.com"
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>
          )}

          {selectedMethod.type === 'digital_wallet' && (
            <>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Wallet Type</Text>
                <View style={styles.radioGroup}>
                  {['venmo', 'cashapp', 'zelle'].map((type) => (
                    <TouchableOpacity
                      key={type}
                      style={styles.radioOption}
                      onPress={() => setDigitalWalletDetails(prev => ({ 
                        ...prev, 
                        walletType: type as 'venmo' | 'cashapp' | 'zelle' 
                      }))}
                    >
                      <View style={[styles.radio, digitalWalletDetails.walletType === type && styles.radioSelected]} />
                      <Text style={styles.radioText}>{type.charAt(0).toUpperCase() + type.slice(1)}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>
                  {digitalWalletDetails.walletType === 'venmo' ? 'Venmo Username' : 
                   digitalWalletDetails.walletType === 'cashapp' ? 'Cash App $Cashtag' : 
                   'Zelle Email/Phone'}
                </Text>
                <TextInput
                  style={styles.textInput}
                  value={digitalWalletDetails.identifier}
                  onChangeText={(text) => setDigitalWalletDetails(prev => ({ ...prev, identifier: text }))}
                  placeholder={
                    digitalWalletDetails.walletType === 'venmo' ? '@username' :
                    digitalWalletDetails.walletType === 'cashapp' ? '$cashtag' :
                    'email@example.com'
                  }
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Display Name</Text>
                <TextInput
                  style={styles.textInput}
                  value={digitalWalletDetails.displayName}
                  onChangeText={(text) => setDigitalWalletDetails(prev => ({ ...prev, displayName: text }))}
                  placeholder="Name for this account"
                />
              </View>
            </>
          )}

          {errors.length > 0 && (
            <View style={styles.errorContainer}>
              {errors.map((error, index) => (
                <Text key={index} style={styles.errorText}>• {error}</Text>
              ))}
            </View>
          )}
        </ScrollView>

        <TouchableOpacity
          style={[styles.nextButton, isLoading && styles.disabledButton]}
          onPress={handleDetailsNext}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <Text style={styles.nextButtonText}>Add Payment Method</Text>
          )}
        </TouchableOpacity>
      </View>
    );
  };

  const renderConfirmStep = () => {
    if (!selectedMethod) return null;

    const amount = parseFloat(withdrawalAmount);
    const fees = selectedMethod.type === 'paypal' 
      ? Math.max(0.30, amount * 0.029)
      : selectedMethod.type === 'digital_wallet'
      ? amount * 0.015
      : 0;
    const netAmount = amount - fees;

    return (
      <View style={styles.stepContainer}>
        <Text style={styles.stepTitle}>Confirm Withdrawal</Text>
        <Text style={styles.stepDescription}>
          Please review your withdrawal details
        </Text>

        <View style={styles.confirmationCard}>
          <View style={styles.confirmationRow}>
            <Text style={styles.confirmationLabel}>Withdrawal Amount</Text>
            <Text style={styles.confirmationValue}>${amount.toFixed(2)}</Text>
          </View>

          {fees > 0 && (
            <View style={styles.confirmationRow}>
              <Text style={styles.confirmationLabel}>Processing Fee</Text>
              <Text style={styles.confirmationValue}>-${fees.toFixed(2)}</Text>
            </View>
          )}

          <View style={[styles.confirmationRow, styles.confirmationTotal]}>
            <Text style={styles.confirmationTotalLabel}>You'll Receive</Text>
            <Text style={styles.confirmationTotalValue}>${netAmount.toFixed(2)}</Text>
          </View>

          <View style={styles.confirmationDivider} />

          <View style={styles.confirmationRow}>
            <Text style={styles.confirmationLabel}>Payment Method</Text>
            <Text style={styles.confirmationValue}>{selectedMethod.name}</Text>
          </View>

          <View style={styles.confirmationRow}>
            <Text style={styles.confirmationLabel}>Processing Time</Text>
            <Text style={styles.confirmationValue}>{selectedMethod.processingTime}</Text>
          </View>
        </View>

        <View style={styles.warningContainer}>
          <AlertTriangle size={16} color="#F59E0B" />
          <Text style={styles.warningText}>
            Withdrawals cannot be cancelled once processed. Please ensure your payment details are correct.
          </Text>
        </View>

        <TouchableOpacity
          style={[styles.confirmButton, isLoading && styles.disabledButton]}
          onPress={handleConfirmWithdrawal}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <>
              <Check size={20} color="#FFFFFF" />
              <Text style={styles.confirmButtonText}>Confirm Withdrawal</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
    >
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Withdraw Earnings</Text>
          <TouchableOpacity onPress={onClose}>
            <X size={24} color="#111827" />
          </TouchableOpacity>
        </View>

        {currentStep === 'amount' && renderAmountStep()}
        {currentStep === 'method' && renderMethodStep()}
        {currentStep === 'details' && renderDetailsStep()}
        {currentStep === 'confirm' && renderConfirmStep()}
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    backgroundColor: '#FFFFFF',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#111827',
  },
  stepContainer: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 24,
  },
  stepTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 8,
  },
  stepDescription: {
    fontSize: 16,
    color: '#6B7280',
    marginBottom: 24,
    lineHeight: 22,
  },
  balanceInfo: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    alignItems: 'center',
  },
  balanceLabel: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 4,
  },
  balanceAmount: {
    fontSize: 28,
    fontWeight: '700',
    color: '#10B981',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: '#E5E7EB',
  },
  inputIcon: {
    marginRight: 12,
  },
  amountInput: {
    flex: 1,
    fontSize: 24,
    fontWeight: '600',
    color: '#111827',
  },
  errorContainer: {
    backgroundColor: '#FEF2F2',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  errorText: {
    fontSize: 14,
    color: '#EF4444',
    marginBottom: 2,
  },
  minimumNote: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 24,
  },
  nextButton: {
    backgroundColor: '#F97316',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 'auto',
    marginBottom: 20,
  },
  disabledButton: {
    backgroundColor: '#D1D5DB',
  },
  nextButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
  methodsList: {
    flex: 1,
  },
  methodCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  methodIcon: {
    marginRight: 16,
  },
  methodInfo: {
    flex: 1,
  },
  methodName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  methodProcessing: {
    fontSize: 14,
    color: '#6B7280',
  },
  methodFees: {
    fontSize: 12,
    color: '#EF4444',
    marginTop: 2,
  },
  defaultBadge: {
    backgroundColor: '#10B981',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  defaultText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  addMethodSection: {
    marginTop: 24,
  },
  addMethodTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 16,
  },
  addMethodCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#E5E7EB',
    borderStyle: 'dashed',
  },
  addMethodInfo: {
    marginLeft: 16,
  },
  addMethodName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  addMethodDescription: {
    fontSize: 14,
    color: '#6B7280',
  },
  detailsForm: {
    flex: 1,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 8,
  },
  textInput: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#111827',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  radioGroup: {
    flexDirection: 'row',
    gap: 16,
  },
  radioOption: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#D1D5DB',
    marginRight: 8,
  },
  radioSelected: {
    borderColor: '#F97316',
    backgroundColor: '#F97316',
  },
  radioText: {
    fontSize: 16,
    color: '#111827',
  },
  confirmationCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  confirmationRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  confirmationLabel: {
    fontSize: 16,
    color: '#6B7280',
  },
  confirmationValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  confirmationTotal: {
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    marginTop: 8,
    paddingTop: 16,
  },
  confirmationTotalLabel: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  confirmationTotalValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#10B981',
  },
  confirmationDivider: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginVertical: 16,
  },
  warningContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFFBEB',
    borderRadius: 8,
    padding: 12,
    marginBottom: 24,
  },
  warningText: {
    fontSize: 14,
    color: '#92400E',
    marginLeft: 8,
    flex: 1,
    lineHeight: 20,
  },
  confirmButton: {
    backgroundColor: '#10B981',
    borderRadius: 12,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 'auto',
    marginBottom: 20,
  },
  confirmButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 8,
  },
});