import { IAuthRepository } from './interfaces/IAuthRepository';
import { SupabaseAuthRepository } from './repositories/SupabaseAuthRepository';
import { 
  User, 
  SignInData, 
  SignUpData, 
  AuthSession,
  AuthError,
  AuthErrorCode,
  AuthEvent,
  AuthEventType
} from '@/types/auth';
import { logger } from '@/utils/logger';
import { EventEmitter } from '@/utils/EventEmitter';
import { CacheService } from '@/services/cache/CacheService';
import { Platform } from 'react-native';

/**
 * Main authentication service that orchestrates all auth operations
 * Implements facade pattern to provide a clean API for authentication
 */
export class AuthService {
  private static instance: AuthService;
  private repository: IAuthRepository;
  private eventEmitter: EventEmitter<AuthEvent>;
  private cache: CacheService;
  private sessionCheckInterval?: NodeJS.Timeout;

  private constructor(repository?: IAuthRepository) {
    this.repository = repository || new SupabaseAuthRepository();
    this.eventEmitter = new EventEmitter();
    this.cache = new CacheService();
    this.startSessionMonitoring();
  }

  static getInstance(repository?: IAuthRepository): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService(repository);
    }
    return AuthService.instance;
  }

  /**
   * Sign in a user with email and password
   */
  async signIn(data: SignInData): Promise<AuthSession> {
    try {
      logger.info('Attempting sign in', { email: data.email });

      // Check cache for existing session
      const cachedSession = await this.cache.get<AuthSession>(`session:${data.email}`);
      if (cachedSession && this.isSessionValid(cachedSession)) {
        logger.info('Using cached session', { email: data.email });
        return cachedSession;
      }

      // Perform sign in
      const session = await this.repository.signIn(data);

      // Cache the session
      await this.cache.set(`session:${session.user.email}`, session, {
        ttl: session.tokens.expiresIn,
      });

      // Emit sign in event
      this.emitAuthEvent('SIGNED_IN', session);

      return session;

    } catch (error) {
      logger.error('Sign in failed', { error, email: data.email });
      
      // Handle specific error cases
      if (error instanceof AuthError) {
        if (error.code === AuthErrorCode.NETWORK_ERROR && Platform.OS !== 'web') {
          // Attempt offline mode if supported
          const offlineSession = await this.attemptOfflineSignIn(data.email);
          if (offlineSession) {
            return offlineSession;
          }
        }
        throw error;
      }

      throw new AuthError(
        AuthErrorCode.UNKNOWN_ERROR,
        'Sign in failed. Please try again.'
      );
    }
  }

  /**
   * Register a new user
   */
  async signUp(data: SignUpData): Promise<AuthSession> {
    try {
      logger.info('Attempting sign up', { email: data.email, role: data.role });

      const session = await this.repository.signUp(data);

      // Cache the session if auto-confirmed
      if (session.tokens.accessToken) {
        await this.cache.set(`session:${session.user.email}`, session, {
          ttl: session.tokens.expiresIn,
        });
      }

      // Emit sign up event
      this.emitAuthEvent('SIGNED_IN', session);

      return session;

    } catch (error) {
      logger.error('Sign up failed', { error, email: data.email });
      throw error instanceof AuthError ? error : new AuthError(
        AuthErrorCode.UNKNOWN_ERROR,
        'Sign up failed. Please try again.'
      );
    }
  }

  /**
   * Sign out the current user
   */
  async signOut(): Promise<void> {
    try {
      const session = await this.getCurrentSession();
      
      if (session) {
        await this.repository.signOut(session.sessionId);
        await this.cache.delete(`session:${session.user.email}`);
      }

      this.emitAuthEvent('SIGNED_OUT', null);
      logger.info('User signed out successfully');

    } catch (error) {
      logger.error('Sign out failed', { error });
      // Always clear local state even if remote sign out fails
      this.emitAuthEvent('SIGNED_OUT', null);
    }
  }

  /**
   * Get the current authenticated session
   */
  async getCurrentSession(): Promise<AuthSession | null> {
    try {
      const session = await this.repository.getCurrentSession();
      
      if (session && this.isSessionValid(session)) {
        return session;
      }

      return null;

    } catch (error) {
      logger.error('Failed to get current session', { error });
      return null;
    }
  }

  /**
   * Get the current authenticated user
   */
  async getCurrentUser(): Promise<User | null> {
    const session = await this.getCurrentSession();
    return session?.user || null;
  }

  /**
   * Refresh the current session
   */
  async refreshSession(): Promise<AuthSession | null> {
    try {
      const currentSession = await this.getCurrentSession();
      
      if (!currentSession) {
        return null;
      }

      const newTokens = await this.repository.refreshSession(
        currentSession.tokens.refreshToken
      );

      const updatedSession: AuthSession = {
        ...currentSession,
        tokens: newTokens,
      };

      // Update cache
      await this.cache.set(
        `session:${currentSession.user.email}`,
        updatedSession,
        { ttl: newTokens.expiresIn }
      );

      this.emitAuthEvent('TOKEN_REFRESHED', updatedSession);

      return updatedSession;

    } catch (error) {
      logger.error('Failed to refresh session', { error });
      
      if (error instanceof AuthError && 
          error.code === AuthErrorCode.REFRESH_TOKEN_EXPIRED) {
        await this.signOut();
      }
      
      return null;
    }
  }

  /**
   * Update user profile
   */
  async updateProfile(updates: Partial<User>): Promise<User> {
    try {
      const session = await this.getCurrentSession();
      
      if (!session) {
        throw new AuthError(
          AuthErrorCode.INVALID_TOKEN,
          'No active session'
        );
      }

      const updatedUser = await this.repository.updateUserProfile(
        session.user.id,
        updates
      );

      // Update cached session
      const updatedSession: AuthSession = {
        ...session,
        user: updatedUser,
      };

      await this.cache.set(
        `session:${updatedUser.email}`,
        updatedSession,
        { ttl: session.tokens.expiresIn }
      );

      this.emitAuthEvent('USER_UPDATED', updatedSession);

      return updatedUser;

    } catch (error) {
      logger.error('Failed to update profile', { error });
      throw error instanceof AuthError ? error : new AuthError(
        AuthErrorCode.UNKNOWN_ERROR,
        'Failed to update profile'
      );
    }
  }

  /**
   * Request password reset
   */
  async resetPassword(email: string): Promise<void> {
    try {
      await this.repository.resetPassword(email);
      logger.info('Password reset email sent', { email });
    } catch (error) {
      logger.error('Failed to send password reset', { error, email });
      throw error instanceof AuthError ? error : new AuthError(
        AuthErrorCode.UNKNOWN_ERROR,
        'Failed to send password reset email'
      );
    }
  }

  /**
   * Update user password
   */
  async updatePassword(currentPassword: string, newPassword: string): Promise<void> {
    try {
      const session = await this.getCurrentSession();
      
      if (!session) {
        throw new AuthError(
          AuthErrorCode.INVALID_TOKEN,
          'No active session'
        );
      }

      await this.repository.updatePassword(
        session.user.id,
        currentPassword,
        newPassword
      );

      this.emitAuthEvent('PASSWORD_RESET', session);
      logger.info('Password updated successfully');

    } catch (error) {
      logger.error('Failed to update password', { error });
      throw error instanceof AuthError ? error : new AuthError(
        AuthErrorCode.UNKNOWN_ERROR,
        'Failed to update password'
      );
    }
  }

  /**
   * Subscribe to authentication events
   */
  onAuthStateChange(
    callback: (event: AuthEvent) => void
  ): () => void {
    return this.eventEmitter.on('*', callback);
  }

  /**
   * Test authentication connection
   */
  async testConnection(): Promise<boolean> {
    try {
      const session = await this.repository.getCurrentSession();
      return session !== null;
    } catch {
      return false;
    }
  }

  // Private helper methods

  private isSessionValid(session: AuthSession): boolean {
    if (!session.tokens.accessToken) {
      return false;
    }

    // Check if token is expired
    const expiresAt = new Date(Date.now() + session.tokens.expiresIn * 1000);
    return expiresAt > new Date();
  }

  private emitAuthEvent(type: AuthEventType, session: AuthSession | null): void {
    const event: AuthEvent = {
      type,
      session,
      timestamp: new Date().toISOString(),
    };
    this.eventEmitter.emit(type, event);
  }

  private startSessionMonitoring(): void {
    // Check session validity every 5 minutes
    this.sessionCheckInterval = setInterval(async () => {
      const session = await this.getCurrentSession();
      
      if (session && !this.isSessionValid(session)) {
        // Attempt to refresh
        const refreshed = await this.refreshSession();
        
        if (!refreshed) {
          await this.signOut();
          this.emitAuthEvent('SESSION_EXPIRED', null);
        }
      }
    }, 5 * 60 * 1000);
  }

  private async attemptOfflineSignIn(email: string): Promise<AuthSession | null> {
    // Check if we have a cached session that might still be valid
    const cachedSession = await this.cache.get<AuthSession>(`session:${email}`);
    
    if (cachedSession) {
      logger.info('Using offline session', { email });
      return cachedSession;
    }
    
    return null;
  }

  // Cleanup method
  destroy(): void {
    if (this.sessionCheckInterval) {
      clearInterval(this.sessionCheckInterval);
    }
    this.eventEmitter.removeAllListeners();
  }
}

// Export singleton instance
export const authService = AuthService.getInstance();
