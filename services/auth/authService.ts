import { IAuthRepository } from './interfaces/IAuthRepository';
import { EnhancedSupabaseAuthRepository } from './repositories/EnhancedSupabaseAuthRepository';
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
import { NetworkUtils } from '@/utils/network/networkUtils';

/**
 * Main authentication service with enhanced error handling
 */
export class AuthService {
  private static instance: AuthService;
  private repository: IAuthRepository;
  private eventEmitter: EventEmitter<AuthEvent>;
  private cache: CacheService;
  private sessionCheckInterval?: NodeJS.Timeout;

  private constructor(repository?: IAuthRepository) {
    this.repository = repository || new EnhancedSupabaseAuthRepository();
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
   * Sign in a user with enhanced error handling
   */
  async signIn(data: SignInData): Promise<AuthSession> {
    const startTime = Date.now();
    const requestId = `signin_${startTime}`;

    try {
      logger.info(`[${requestId}] Attempting sign in`, { 
        email: data.email,
        platform: Platform.OS,
        timestamp: new Date().toISOString(),
      });

      // Pre-flight network check
      const networkInfo = await NetworkUtils.getNetworkInfo();
      logger.debug(`[${requestId}] Network status`, networkInfo);

      if (!networkInfo?.isConnected) {
        throw new AuthError(
          AuthErrorCode.NETWORK_ERROR,
          'No internet connection. Please check your network settings and try again.'
        );
      }

      // Check cache for existing session
      const cachedSession = await this.cache.get<AuthSession>(`session:${data.email}`);
      if (cachedSession && this.isSessionValid(cachedSession)) {
        logger.info(`[${requestId}] Using cached session`, { email: data.email });
        return cachedSession;
      }

      // Perform sign in with detailed logging
      logger.debug(`[${requestId}] Calling repository.signIn`);
      const session = await this.repository.signIn(data);
      
      const duration = Date.now() - startTime;
      logger.info(`[${requestId}] Sign in successful`, {
        email: data.email,
        userId: session.user.id,
        duration: `${duration}ms`,
      });

      // Cache the session
      await this.cache.set(`session:${session.user.email}`, session, {
        ttl: session.tokens.expiresIn,
      });

      // Emit sign in event
      this.emitAuthEvent('SIGNED_IN', session);

      return session;

    } catch (error) {
      const duration = Date.now() - startTime;
      
      logger.error(`[${requestId}] Sign in failed`, { 
        error: error instanceof Error ? {
          name: error.name,
          message: error.message,
          stack: error.stack,
          code: (error as AuthError).code,
        } : error,
        email: data.email,
        duration: `${duration}ms`,
        platform: Platform.OS,
        networkInfo: await NetworkUtils.getNetworkInfo(),
      });
      
      // Handle specific error cases
      if (error instanceof AuthError) {
        // Add platform-specific error details
        if (Platform.OS === 'ios' && error.code === AuthErrorCode.NETWORK_ERROR) {
          error.message += '\n\nOn iOS, please ensure:\n- Wi-Fi or cellular data is enabled\n- The app has network permissions\n- No VPN is blocking the connection';
        } else if (Platform.OS === 'android' && error.code === AuthErrorCode.NETWORK_ERROR) {
          error.message += '\n\nOn Android, please ensure:\n- Internet permission is granted\n- No firewall is blocking the app\n- Data saver mode is not restricting the app';
        }
        
        throw error;
      }

      throw new AuthError(
        AuthErrorCode.UNKNOWN_ERROR,
        `Sign in failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Register a new user with enhanced error handling
   */
  async signUp(data: SignUpData): Promise<AuthSession> {
    const startTime = Date.now();
    const requestId = `signup_${startTime}`;

    try {
      logger.info(`[${requestId}] Attempting sign up`, { 
        email: data.email, 
        role: data.role,
        platform: Platform.OS,
        timestamp: new Date().toISOString(),
      });

      // Pre-flight network check
      const networkInfo = await NetworkUtils.getNetworkInfo();
      logger.debug(`[${requestId}] Network status`, networkInfo);

      if (!networkInfo?.isConnected) {
        throw new AuthError(
          AuthErrorCode.NETWORK_ERROR,
          'No internet connection. Please check your network settings and try again.'
        );
      }

      // Validate input data
      if (!data.email || !data.password) {
        throw new AuthError(
          AuthErrorCode.VALIDATION_ERROR,
          'Email and password are required'
        );
      }

      logger.debug(`[${requestId}] Calling repository.signUp`);
      const session = await this.repository.signUp(data);

      const duration = Date.now() - startTime;
      logger.info(`[${requestId}] Sign up successful`, {
        email: data.email,
        userId: session.user.id,
        role: data.role,
        duration: `${duration}ms`,
        emailConfirmed: session.user.emailVerified,
      });

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
      const duration = Date.now() - startTime;
      
      logger.error(`[${requestId}] Sign up failed`, { 
        error: error instanceof Error ? {
          name: error.name,
          message: error.message,
          stack: error.stack,
          code: (error as AuthError).code,
        } : error,
        email: data.email,
        role: data.role,
        duration: `${duration}ms`,
        platform: Platform.OS,
        networkInfo: await NetworkUtils.getNetworkInfo(),
      });

      if (error instanceof AuthError) {
        throw error;
      }

      throw new AuthError(
        AuthErrorCode.UNKNOWN_ERROR,
        `Sign up failed: ${error instanceof Error ? error.message : 'Unknown error'}`
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
      const isConnected = await NetworkUtils.isConnected();
      if (!isConnected) {
        logger.warn('No network connection for auth test');
        return false;
      }

      const session = await this.repository.getCurrentSession();
      return session !== null;
    } catch (error) {
      logger.error('Auth connection test failed', { error });
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
