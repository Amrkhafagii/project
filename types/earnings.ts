export interface WithdrawalMethod {
  id: string;
  type: 'bank_transfer' | 'paypal' | 'digital_wallet';
  name: string;
  details: BankDetails | PayPalDetails | DigitalWalletDetails;
  isDefault: boolean;
  isVerified: boolean;
  processingTime: string;
  fees: number;
}

export interface BankDetails {
  accountNumber: string;
  routingNumber: string;
  accountHolderName: string;
  bankName: string;
  accountType: 'checking' | 'savings';
}

export interface PayPalDetails {
  email: string;
  isVerified: boolean;
}

export interface DigitalWalletDetails {
  walletType: 'venmo' | 'cashapp' | 'zelle';
  identifier: string;
  displayName: string;
}

export interface WithdrawalRequest {
  id: string;
  amount: number;
  method: WithdrawalMethod;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';
  requestedAt: Date;
  processedAt?: Date;
  fees: number;
  netAmount: number;
  transactionId?: string;
  failureReason?: string;
}

export interface WithdrawalHistory {
  requests: WithdrawalRequest[];
  totalWithdrawn: number;
  pendingAmount: number;
  availableBalance: number;
}
