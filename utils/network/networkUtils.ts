import NetInfo from '@react-native-community/netinfo';
import { Platform } from 'react-native';
import { logger } from '@/utils/logger';

/**
 * Network utility functions for debugging and monitoring
 */
export class NetworkUtils {
  /**
   * Check if device has internet connectivity
   */
  static async isConnected(): Promise<boolean> {
    try {
      const state = await NetInfo.fetch();
      logger.debug('Network state:', {
        isConnected: state.isConnected,
        type: state.type,
        isInternetReachable: state.isInternetReachable,
        details: state.details,
      });
      return state.isConnected ?? false;
    } catch (error) {
      logger.error('Failed to check network connectivity', error);
      return false;
    }
  }

  /**
   * Get detailed network information for debugging
   */
  static async getNetworkInfo(): Promise<any> {
    try {
      const state = await NetInfo.fetch();
      return {
        isConnected: state.isConnected,
        isInternetReachable: state.isInternetReachable,
        type: state.type,
        details: state.details,
        platform: Platform.OS,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      logger.error('Failed to get network info', error);
      return null;
    }
  }

  /**
   * Monitor network connectivity changes
   */
  static subscribeToNetworkChanges(
    callback: (isConnected: boolean) => void
  ): () => void {
    const unsubscribe = NetInfo.addEventListener(state => {
      logger.info('Network state changed:', {
        isConnected: state.isConnected,
        type: state.type,
      });
      callback(state.isConnected ?? false);
    });

    return unsubscribe;
  }

  /**
   * Test connectivity to a specific endpoint
   */
  static async testEndpoint(url: string): Promise<boolean> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);

      const response = await fetch(url, {
        method: 'HEAD',
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      
      logger.debug('Endpoint test result:', {
        url,
        status: response.status,
        ok: response.ok,
      });

      return response.ok;
    } catch (error) {
      logger.error('Endpoint test failed:', {
        url,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      return false;
    }
  }
}

/**
 * Retry configuration for network requests
 */
export interface RetryConfig {
  maxAttempts: number;
  initialDelay: number;
  maxDelay: number;
  backoffMultiplier: number;
}

export const defaultRetryConfig: RetryConfig = {
  maxAttempts: 3,
  initialDelay: 1000,
  maxDelay: 10000,
  backoffMultiplier: 2,
};

/**
 * Execute a function with exponential backoff retry logic
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  config: RetryConfig = defaultRetryConfig,
  onRetry?: (attempt: number, error: Error) => void
): Promise<T> {
  let lastError: Error;
  let delay = config.initialDelay;

  for (let attempt = 1; attempt <= config.maxAttempts; attempt++) {
    try {
      logger.debug(`Attempt ${attempt}/${config.maxAttempts}`);
      return await fn();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error('Unknown error');
      
      logger.warn(`Attempt ${attempt} failed:`, {
        error: lastError.message,
        willRetry: attempt < config.maxAttempts,
      });

      if (attempt < config.maxAttempts) {
        if (onRetry) {
          onRetry(attempt, lastError);
        }

        await new Promise(resolve => setTimeout(resolve, delay));
        delay = Math.min(delay * config.backoffMultiplier, config.maxDelay);
      }
    }
  }

  throw lastError!;
}
