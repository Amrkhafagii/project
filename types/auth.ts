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
