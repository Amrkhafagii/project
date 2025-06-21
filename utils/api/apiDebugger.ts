import { logger } from '@/utils/logger';
import { NetworkUtils } from '@/utils/network/networkUtils';

/**
 * Enhanced API debugger for detailed request/response logging
 */
export class ApiDebugger {
  private static requestId = 0;

  /**
   * Log detailed request information
   */
  static logRequest(
    url: string,
    method: string,
    headers: Record<string, string>,
    body?: any
  ): string {
    const id = `req_${++this.requestId}_${Date.now()}`;
    const stack = new Error().stack;

    logger.info(`🚀 API Request [${id}]`, {
      id,
      url,
      method,
      headers: this.sanitizeHeaders(headers),
      body: body ? this.sanitizeBody(body) : undefined,
      timestamp: new Date().toISOString(),
      stack: this.extractCallerInfo(stack),
    });

    return id;
  }

  /**
   * Log detailed response information
   */
  static logResponse(
    requestId: string,
    response: Response,
    responseData?: any,
    duration?: number
  ): void {
    logger.info(`✅ API Response [${requestId}]`, {
      requestId,
      status: response.status,
      statusText: response.statusText,
      headers: this.extractResponseHeaders(response),
      data: responseData,
      duration: duration ? `${duration}ms` : undefined,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Log detailed error information
   */
  static async logError(
    requestId: string,
    error: Error,
    context: {
      url: string;
      method: string;
      headers?: Record<string, string>;
      body?: any;
    }
  ): Promise<void> {
    const networkInfo = await NetworkUtils.getNetworkInfo();
    const stack = error.stack || new Error().stack;

    logger.error(`❌ API Error [${requestId}]`, {
      requestId,
      error: {
        name: error.name,
        message: error.message,
        stack: stack,
        type: error.constructor.name,
      },
      context: {
        ...context,
        headers: context.headers ? this.sanitizeHeaders(context.headers) : undefined,
        body: context.body ? this.sanitizeBody(context.body) : undefined,
      },
      network: networkInfo,
      timestamp: new Date().toISOString(),
      callerInfo: this.extractCallerInfo(stack),
    });
  }

  /**
   * Sanitize headers to remove sensitive information
   */
  private static sanitizeHeaders(headers: Record<string, string>): Record<string, string> {
    const sanitized = { ...headers };
    
    // Mask authorization tokens
    if (sanitized.authorization) {
      sanitized.authorization = sanitized.authorization.substring(0, 20) + '...';
    }
    
    if (sanitized.Authorization) {
      sanitized.Authorization = sanitized.Authorization.substring(0, 20) + '...';
    }

    return sanitized;
  }

  /**
   * Sanitize body to remove sensitive information
   */
  private static sanitizeBody(body: any): any {
    if (typeof body === 'string') {
      try {
        body = JSON.parse(body);
      } catch {
        return body;
      }
    }

    const sanitized = { ...body };
    
    // Mask sensitive fields
    const sensitiveFields = ['password', 'token', 'secret', 'apiKey'];
    sensitiveFields.forEach(field => {
      if (sanitized[field]) {
        sanitized[field] = '***';
      }
    });

    return sanitized;
  }

  /**
   * Extract response headers for logging
   */
  private static extractResponseHeaders(response: Response): Record<string, string> {
    const headers: Record<string, string> = {};
    response.headers.forEach((value, key) => {
      headers[key] = value;
    });
    return headers;
  }

  /**
   * Extract caller information from stack trace
   */
  private static extractCallerInfo(stack?: string): string {
    if (!stack) return 'Unknown caller';

    const lines = stack.split('\n');
    // Find the first line that's not from this file or logger
    const callerLine = lines.find(line => 
      !line.includes('apiDebugger') && 
      !line.includes('logger') &&
      line.includes('at ')
    );

    return callerLine ? callerLine.trim() : 'Unknown caller';
  }
}
