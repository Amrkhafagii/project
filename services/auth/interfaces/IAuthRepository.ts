import { User, SignInData, SignUpData, AuthSession, AuthTokens } from '@/types/auth';

/**
 * Authentication repository interface for dependency injection
 * Allows for easy testing and swapping of authentication providers
 */
export interface IAuthRepository {
  // Authentication methods
  signIn(data: SignInData): Promise<AuthSession>;
  signUp(data: SignUpData): Promise<AuthSession>;
  signOut(sessionId?: string): Promise<void>;
  
  // Session management
  getCurrentSession(): Promise<AuthSession | null>;
  refreshSession(refreshToken: string): Promise<AuthTokens>;
  validateSession(sessionId: string): Promise<boolean>;
  revokeSession(sessionId: string): Promise<void>;
  
  // User management
  getUserProfile(userId: string): Promise<User>;
  updateUserProfile(userId: string, updates: Partial<User>): Promise<User>;
  deleteAccount(userId: string): Promise<void>;
  
  // Password management
  resetPassword(email: string): Promise<void>;
  updatePassword(userId: string, currentPassword: string, newPassword: string): Promise<void>;
  
  // Email verification
  sendVerificationEmail(email: string): Promise<void>;
  verifyEmail(token: string): Promise<void>;
  
  // Device management
  getDevices(userId: string): Promise<DeviceInfo[]>;
  removeDevice(userId: string, deviceId: string): Promise<void>;
  
  // Security
  checkLoginAttempts(email: string): Promise<{ attempts: number; lockedUntil?: Date }>;
  recordLoginAttempt(email: string, success: boolean): Promise<void>;
}

import { DeviceInfo } from '@/types/auth';
