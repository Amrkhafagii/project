import { SecurityConfig } from '@/types/auth';
import * as Crypto from 'expo-crypto';

/**
 * Handles security-related operations for authentication
 * Implements security best practices and configurations
 */
export class SecurityService {
  private securityConfig: SecurityConfig = {
    maxLoginAttempts: 5,
    lockoutDuration: 30, // 30 minutes
    sessionTimeout: 60, // 60 minutes
    refreshTokenLifetime: 30, // 30 days
    passwordMinLength: 8,
    passwordRequireUppercase: true,
    passwordRequireNumbers: true,
    passwordRequireSpecialChars: true,
  };

  getSecurityConfig(): SecurityConfig {
    return { ...this.securityConfig };
  }

  async hashPassword(password: string): Promise<string> {
    // In a real implementation, this would use bcrypt or similar
    // For React Native, we'd typically handle this server-side
    return password; // Server handles hashing
  }

  async generateSecureToken(): Promise<string> {
    const randomBytes = await Crypto.getRandomBytesAsync(32);
    return Crypto.digest(Crypto.CryptoDigestAlgorithm.SHA256, randomBytes);
  }

  async generateSessionId(): Promise<string> {
    const timestamp = Date.now().toString();
    const random = await this.generateSecureToken();
    return `${timestamp}-${random}`;
  }

  validateSessionTimeout(lastActivity: Date): boolean {
    const now = new Date();
    const diffMinutes = (now.getTime() - lastActivity.getTime()) / (1000 * 60);
    return diffMinutes < this.securityConfig.sessionTimeout;
  }

  sanitizeInput(input: string): string {
    // Remove potentially harmful characters
    return input
      .replace(/[<>]/g, '')
      .replace(/javascript:/gi, '')
      .replace(/on\w+=/gi, '')
      .trim();
  }

  isStrongPassword(password: string): boolean {
    if (password.length < this.securityConfig.passwordMinLength) {
      return false;
    }

    if (this.securityConfig.passwordRequireUppercase && !/[A-Z]/.test(password)) {
      return false;
    }

    if (this.securityConfig.passwordRequireNumbers && !/[0-9]/.test(password)) {
      return false;
    }

    if (this.securityConfig.passwordRequireSpecialChars && !/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      return false;
    }

    return true;
  }

  generateCSRFToken(): string {
    // Generate a CSRF token for form submissions
    return Math.random().toString(36).substring(2, 15) + 
           Math.random().toString(36).substring(2, 15);
  }

  validateCSRFToken(token: string, storedToken: string): boolean {
    return token === storedToken && token.length > 0;
  }

  // Rate limiting helper
  createRateLimitKey(identifier: string, action: string): string {
    return `rate_limit:${action}:${identifier}`;
  }

  // Security headers for API requests
  getSecurityHeaders(): Record<string, string> {
    return {
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
      'X-XSS-Protection': '1; mode=block',
      'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
      'Content-Security-Policy': "default-src 'self'",
    };
  }
}
