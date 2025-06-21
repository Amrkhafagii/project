import { 
  User, 
  SignInData, 
  SignUpData, 
  AuthSession, 
  AuthTokens 
} from '@/types/auth';

export interface IAuthRepository {
  signIn(data: SignInData): Promise<AuthSession>;
  signUp(data: SignUpData): Promise<AuthSession>;
  signOut(sessionId: string): Promise<void>;
  getCurrentSession(): Promise<AuthSession | null>;
  refreshSession(refreshToken: string): Promise<AuthTokens>;
  updateUserProfile(userId: string, updates: Partial<User>): Promise<User>;
  resetPassword(email: string): Promise<void>;
  updatePassword(userId: string, currentPassword: string, newPassword: string): Promise<void>;
}
