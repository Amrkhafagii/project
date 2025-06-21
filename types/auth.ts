// User roles
export type UserRole = 'customer' | 'driver' | 'restaurant' | 'admin';

// User interface
export interface User {
  id: string;
  email: string;
  role: UserRole;
  fullName: string;
  phoneNumber: string;
  emailVerified: boolean;
  createdAt: string;
  updatedAt: string;
}
export interface SecurityConfig {
  maxLoginAttempts: number;
  lockoutDuration: number;
  sessionTimeout: number;
  requireEmailVerification: boolean;
  allowMultipleSessions: boolean;
}

export interface AuthFormData {
  email: string;
  password?: string;
  confirmPassword?: string;
  fullName?: string;
  phoneNumber?: string;
}

// Authentication tokens
export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

// Authentication session
export interface AuthSession {
  sessionId: string;
  user: User;
  tokens: AuthTokens;
}

// Sign in data
export interface SignInData {
  email: string;
  password: string;
}

// Sign up data
export interface SignUpData {
  email: string;
  password: string;
  fullName: string;
  phoneNumber: string;
  role: UserRole;
}

// Sign up metadata (for backward compatibility)
export interface SignUpMetadata {
  fullName: string;
  phoneNumber: string;
  role: UserRole;
}

// Update profile data
export interface UpdateProfileData {
  fullName?: string;
  phoneNumber?: string;
  role?: UserRole;
}

// Auth error codes
export enum AuthErrorCode {
  // Authentication errors
  INVALID_CREDENTIALS = 'INVALID_CREDENTIALS',
  INVALID_TOKEN = 'INVALID_TOKEN',
  TOKEN_EXPIRED = 'TOKEN_EXPIRED',
  REFRESH_TOKEN_EXPIRED = 'REFRESH_TOKEN_EXPIRED',
  
  // User errors
  USER_NOT_FOUND = 'USER_NOT_FOUND',
  USER_EXISTS = 'USER_EXISTS',
  USER_DISABLED = 'USER_DISABLED',
  
  // Validation errors
  INVALID_EMAIL = 'INVALID_EMAIL',
  WEAK_PASSWORD = 'WEAK_PASSWORD',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  
  // Operation errors
  SIGNUP_FAILED = 'SIGNUP_FAILED',
  PROFILE_CREATION_FAILED = 'PROFILE_CREATION_FAILED',
  UPDATE_FAILED = 'UPDATE_FAILED',
  
  // Network errors
  NETWORK_ERROR = 'NETWORK_ERROR',
  TIMEOUT_ERROR = 'TIMEOUT_ERROR',
  
  // Generic errors
  UNKNOWN_ERROR = 'UNKNOWN_ERROR',
}

// Auth error class
export class AuthError extends Error {
  code: AuthErrorCode;
  
  constructor(code: AuthErrorCode, message: string) {
    super(message);
    this.name = 'AuthError';
    this.code = code;
  }
}

// Auth event types
export type AuthEventType = 
  | 'SIGNED_IN'
  | 'SIGNED_OUT'
  | 'USER_UPDATED'
  | 'TOKEN_REFRESHED'
  | 'SESSION_EXPIRED'
  | 'PASSWORD_RESET';

// Auth event
export interface AuthEvent {
  type: AuthEventType;
  session: AuthSession | null;
  timestamp: string;
}
