import { ApiDebugger } from '@/utils/api/apiDebugger';
import { NetworkUtils, withRetry } from '@/utils/network/networkUtils';
import { logger } from '@/utils/logger';
import { Platform } from 'react-native';

export class NetworkError extends Error {
  constructor(
    message: string,
    public code: string,
    public details?: any
  ) {
    super(message);
    this.name = 'NetworkError';
  }
}

export interface RequestConfig {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  headers?: Record<string, string>;
  body?: any;
  timeout?: number;
  retryConfig?: {
    enabled: boolean;
    maxAttempts?: number;
  };
}

/**
 * Enhanced API client with comprehensive error handling and debugging
 */
export class EnhancedApiClient {
  private baseUrl: string;
  private defaultHeaders: Record<string, string>;
  private defaultTimeout: number = 30000; // 30 seconds

  constructor(baseUrl: string, defaultHeaders?: Record<string, string>) {
    this.baseUrl = baseUrl;
    this.defaultHeaders = {
      'Content-Type': 'application/json',
      ...defaultHeaders,
    };

    // Platform-specific configurations
    if (Platform.OS === 'android') {
      // Android-specific headers if needed
      this.defaultHeaders['X-Platform'] = 'android';
    } else if (Platform.OS === 'ios') {
      // iOS-specific headers if needed
      this.defaultHeaders['X-Platform'] = 'ios';
    }
  }

  /**
   * Make an HTTP request with enhanced error handling and debugging
   */
  async request<T>(
    endpoint: string,
    config: RequestConfig
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const startTime = Date.now();

    // Check network connectivity first
    const isConnected = await NetworkUtils.isConnected();
    if (!isConnected) {
      throw new NetworkError(
        'No internet connection',
        'NETWORK_OFFLINE',
        await NetworkUtils.getNetworkInfo()
      );
    }

    // Test endpoint reachability
    const isReachable = await NetworkUtils.testEndpoint(this.baseUrl);
    if (!isReachable) {
      logger.warn('Base URL not reachable:', { baseUrl: this.baseUrl });
    }

    const headers = {
      ...this.defaultHeaders,
      ...config.headers,
    };

    const requestId = ApiDebugger.logRequest(
      url,
      config.method,
      headers,
      config.body
    );

    const executeRequest = async () => {
      const controller = new AbortController();
      const timeoutId = setTimeout(
        () => controller.abort(),
        config.timeout || this.defaultTimeout
      );

      try {
        const requestOptions: RequestInit = {
          method: config.method,
          headers,
          signal: controller.signal,
        };

        if (config.body) {
          requestOptions.body = JSON.stringify(config.body);
        }

        logger.debug('Fetch options:', requestOptions);

        const response = await fetch(url, requestOptions);
        clearTimeout(timeoutId);

        const duration = Date.now() - startTime;
        
        // Log response
        let responseData: any;
        const contentType = response.headers.get('content-type');
        
        if (contentType?.includes('application/json')) {
          responseData = await response.json();
        } else {
          responseData = await response.text();
        }

        ApiDebugger.logResponse(requestId, response, responseData, duration);

        if (!response.ok) {
          throw new NetworkError(
            `HTTP ${response.status}: ${response.statusText}`,
            `HTTP_${response.status}`,
            {
              status: response.status,
              statusText: response.statusText,
              data: responseData,
              headers: Object.fromEntries(response.headers.entries()),
            }
          );
        }

        return responseData as T;

      } catch (error) {
        clearTimeout(timeoutId);

        // Enhanced error handling
        if (error instanceof Error) {
          await ApiDebugger.logError(requestId, error, {
            url,
            method: config.method,
            headers,
            body: config.body,
          });

          if (error.name === 'AbortError') {
            throw new NetworkError(
              'Request timeout',
              'TIMEOUT',
              { timeout: config.timeout || this.defaultTimeout }
            );
          }

          if (error.message === 'Network request failed') {
            // Common React Native network error
            const networkInfo = await NetworkUtils.getNetworkInfo();
            
            throw new NetworkError(
              'Network request failed - possible causes: CORS, SSL, or connectivity issues',
              'NETWORK_REQUEST_FAILED',
              {
                networkInfo,
                possibleCauses: [
                  'CORS policy blocking the request',
                  'SSL certificate issues',
                  'Incorrect API endpoint',
                  'Network connectivity problems',
                  'Platform-specific network restrictions',
                ],
                platformNotes: this.getPlatformSpecificNotes(),
              }
            );
          }

          throw error;
        }

        throw new NetworkError(
          'Unknown error occurred',
          'UNKNOWN',
          { originalError: error }
        );
      }
    };

    // Execute with retry if enabled
    if (config.retryConfig?.enabled) {
      return withRetry(
        executeRequest,
        {
          maxAttempts: config.retryConfig.maxAttempts || 3,
          initialDelay: 1000,
          maxDelay: 10000,
          backoffMultiplier: 2,
        },
        (attempt, error) => {
          logger.warn(`Retry attempt ${attempt} for ${url}`, { error: error.message });
        }
      );
    }

    return executeRequest();
  }

  /**
   * GET request
   */
  async get<T>(endpoint: string, config?: Partial<RequestConfig>): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'GET',
      ...config,
    });
  }

  /**
   * POST request
   */
  async post<T>(
    endpoint: string,
    body?: any,
    config?: Partial<RequestConfig>
  ): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body,
      ...config,
    });
  }

  /**
   * PUT request
   */
  async put<T>(
    endpoint: string,
    body?: any,
    config?: Partial<RequestConfig>
  ): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body,
      ...config,
    });
  }

  /**
   * DELETE request
   */
  async delete<T>(endpoint: string, config?: Partial<RequestConfig>): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'DELETE',
      ...config,
    });
  }

  /**
   * Get platform-specific debugging notes
   */
  private getPlatformSpecificNotes(): Record<string, string[]> {
    return {
      ios: [
        'Check Info.plist for NSAppTransportSecurity settings',
        'Ensure SSL certificates are valid',
        'Check if running on simulator vs device',
      ],
      android: [
        'Check AndroidManifest.xml for INTERNET permission',
        'For API 28+, ensure usesCleartextTraffic is set if using HTTP',
        'Check network_security_config.xml for domain configurations',
      ],
      web: [
        'Check CORS configuration on the server',
        'Ensure HTTPS is used in production',
        'Check browser console for detailed error messages',
      ],
    };
  }
}
