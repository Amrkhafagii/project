import { 
  User, 
  SignInData, 
  SignUpData, 
  AuthSession,
  AuthTokens
} from '@/types/auth';

/**
 * Repository interface for authentication data operations
 */
export interface IAuthRepository {
  // Authentication operations
  signIn(data: SignInData): Promise<AuthSession>;
  signUp(data: SignUpData): Promise<AuthSession>;
  signOut(sessionId: string): Promise<void>;
  
  // Session management
  getCurrentSession(): Promise<AuthSession | null>;
  refreshSession(refreshToken: string): Promise<AuthTokens>;
  
  // User operations
  getUserById(userId: string): Promise<User | null>;
  updateUserProfile(userId: string, updates: Partial<User>): Promise<User>;
  
  // Password operations
  resetPassword(email: string): Promise<void>;
  updatePassword(userId: string, currentPassword: string, newPassword: string): Promise<void>;
  
  // Utility operations
  validateSession(session: AuthSession): Promise<boolean>;
}
