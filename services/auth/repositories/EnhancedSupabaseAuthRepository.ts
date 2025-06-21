import { SupabaseAuthRepository } from './SupabaseAuthRepository';
import { 
  AuthSession,
  SignInData,
  SignUpData,
  AuthError,
  AuthErrorCode
} from '@/types/auth';
import { logger } from '@/utils/logger';
import { NetworkUtils } from '@/utils/network/networkUtils';
import { Platform } from 'react-native';

/**
 * Enhanced Supabase repository with additional error handling and logging
 */
export class EnhancedSupabaseAuthRepository extends SupabaseAuthRepository {
  private requestCounter = 0;

  async signIn(data: SignInData): Promise<AuthSession> {
    const requestId = `repo_signin_${++this.requestCounter}`;
    const startTime = Date.now();

    try {
      logger.debug(`[${requestId}] Starting repository signIn`, {
        email: data.email,
        platform: Platform.OS,
      });

      // Check network before attempting
      const networkInfo = await NetworkUtils.getNetworkInfo();
      if (!networkInfo?.isConnected) {
        throw new AuthError(
          AuthErrorCode.NETWORK_ERROR,
          'No internet connection available'
        );
      }

      const result = await super.signIn(data);
      
      const duration = Date.now() - startTime;
      logger.debug(`[${requestId}] Repository signIn successful`, {
        duration: `${duration}ms`,
        userId: result.user.id,
      });

      return result;
    } catch (error) {
      const duration = Date.now() - startTime;
      logger.error(`[${requestId}] Repository signIn failed`, {
        error,
        duration: `${duration}ms`,
      });
      throw error;
    }
  }

  async signUp(data: SignUpData): Promise<AuthSession> {
    const requestId = `repo_signup_${++this.requestCounter}`;
    const startTime = Date.now();

    try {
      logger.debug(`[${requestId}] Starting repository signUp`, {
        email: data.email,
        role: data.role,
        platform: Platform.OS,
      });

      // Check network before attempting
      const networkInfo = await NetworkUtils.getNetworkInfo();
      if (!networkInfo?.isConnected) {
        throw new AuthError(
          AuthErrorCode.NETWORK_ERROR,
          'No internet connection available'
        );
      }

      const result = await super.signUp(data);
      
      const duration = Date.now() - startTime;
      logger.debug(`[${requestId}] Repository signUp successful`, {
        duration: `${duration}ms`,
        userId: result.user.id,
        emailConfirmed: result.user.emailVerified,
      });

      return result;
    } catch (error) {
      const duration = Date.now() - startTime;
      logger.error(`[${requestId}] Repository signUp failed`, {
        error,
        duration: `${duration}ms`,
      });
      throw error;
    }
  }

  async getCurrentSession(): Promise<AuthSession | null> {
    const requestId = `repo_session_${++this.requestCounter}`;

    try {
      logger.debug(`[${requestId}] Fetching current session`);
      
      const session = await super.getCurrentSession();
      
      if (session) {
        logger.debug(`[${requestId}] Session found`, {
          userId: session.user.id,
          email: session.user.email,
        });
      } else {
        logger.debug(`[${requestId}] No active session`);
      }

      return session;
    } catch (error) {
      logger.error(`[${requestId}] Failed to get session`, { error });
      return null;
    }
  }
}
