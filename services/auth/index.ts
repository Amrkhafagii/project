// Export all auth-related modules
export { AuthProvider, AuthContext } from './AuthProvider';
export { useAuth } from './hooks/useAuth';
export { authService, AuthService } from './AuthService';

// Export interfaces for extension
export type { IAuthRepository } from './interfaces/IAuthRepository';
export type { IAuthService } from './interfaces/IAuthService';

// Export repository implementations
export { SupabaseAuthRepository } from './repositories/SupabaseAuthRepository';
export { EnhancedSupabaseAuthRepository } from './repositories/EnhancedSupabaseAuthRepository';

// Re-export auth types
export * from '@/types/auth';
