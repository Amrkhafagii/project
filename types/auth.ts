export type UserRole = 'customer' | 'restaurant' | 'driver' | 'admin';

export interface User {
  id: string;
  email: string;
  role?: UserRole;
  fullName?: string;
  phoneNumber?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface AuthFormData {
  email: string;
  password?: string;
  confirmPassword?: string;
  fullName?: string;
  phoneNumber?: string;
}

export interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
}

export interface SignUpMetadata {
  fullName: string;
  phoneNumber: string;
  role: UserRole;
}

export interface UpdateProfileData {
  fullName?: string;
  phoneNumber?: string;
  role?: UserRole;
}

// New type definitions for auth service
export interface SignInData {
  email: string;
  password: string;
  deviceInfo?: DeviceInfo;
}

export interface SignUpData {
  email: string;
  password: string;
  fullName: string;
  phoneNumber: string;
  role: UserRole;
  deviceInfo?: DeviceInfo;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  tokenType: string;
}

export interface AuthSession {
  user: User;
  tokens: AuthTokens;
  sessionId: string;
  expiresAt: string;
}

export interface DeviceInfo {
  platform: string;
  deviceId?: string;
  appVersion?: string;
  osVersion?: string;
}

export interface SecurityConfig {
  maxLoginAttempts: number;
  lockoutDuration: number;
  sessionTimeout: number;
  requireEmailVerification: boolean;
  allowMultipleSessions: boolean;
}

export enum AuthErrorCode {
  INVALID_CREDENTIALS = 'INVALID_CREDENTIALS',
  USER_NOT_FOUND = 'USER_NOT_FOUND',
  EMAIL_NOT_VERIFIED = 'EMAIL_NOT_VERIFIED',
  ACCOUNT_LOCKED = 'ACCOUNT_LOCKED',
  INVALID_TOKEN = 'INVALID_TOKEN',
  TOKEN_EXPIRED = 'TOKEN_EXPIRED',
  REFRESH_TOKEN_EXPIRED = 'REFRESH_TOKEN_EXPIRED',
  NETWORK_ERROR = 'NETWORK_ERROR',
  UNKNOWN_ERROR = 'UNKNOWN_ERROR',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  PERMISSION_DENIED = 'PERMISSION_DENIED',
}

export class AuthError extends Error {
  code: AuthErrorCode;
  
  constructor(code: AuthErrorCode, message: string) {
    super(message);
    this.code = code;
    this.name = 'AuthError';
  }
}

export type AuthEventType = 
  | 'SIGNED_IN'
  | 'SIGNED_OUT'
  | 'TOKEN_REFRESHED'
  | 'USER_UPDATED'
  | 'SESSION_EXPIRED'
  | 'PASSWORD_RESET';

export interface AuthEvent {
  type: AuthEventType;
  session: AuthSession | null;
  timestamp: string;
}
