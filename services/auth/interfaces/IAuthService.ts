import { 
  User, 
  SignInData, 
  SignUpData, 
  AuthSession,
  AuthEvent
} from '@/types/auth';

/**
 * Service interface for authentication business logic
 */
export interface IAuthService {
  // Core authentication
  signIn(data: SignInData): Promise<AuthSession>;
  signUp(data: SignUpData): Promise<AuthSession>;
  signOut(): Promise<void>;
  
  // Session management
  getCurrentSession(): Promise<AuthSession | null>;
  getCurrentUser(): Promise<User | null>;
  refreshSession(): Promise<AuthSession | null>;
  
  // Profile management
  updateProfile(updates: Partial<User>): Promise<User>;
  
  // Password management
  resetPassword(email: string): Promise<void>;
  updatePassword(currentPassword: string, newPassword: string): Promise<void>;
  
  // Event subscription
  onAuthStateChange(callback: (event: AuthEvent) => void): () => void;
  
  // Utility
  testConnection(): Promise<boolean>;
}
