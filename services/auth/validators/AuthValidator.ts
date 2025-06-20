import { SignInData, SignUpData, AuthError, AuthErrorCode } from '@/types/auth';

/**
 * Validates authentication-related data
 * Ensures data integrity and security before processing
 */
export class AuthValidator {
  private emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  private phoneRegex = /^\+?[1-9]\d{1,14}$/;

  validateSignInData(data: SignInData): void {
    if (!data.email || !data.password) {
      throw new AuthError(
        AuthErrorCode.INVALID_CREDENTIALS,
        'Email and password are required'
      );
    }

    if (!this.isValidEmail(data.email)) {
      throw new AuthError(
        AuthErrorCode.INVALID_EMAIL,
        'Please enter a valid email address'
      );
    }

    if (data.password.length < 6) {
      throw new AuthError(
        AuthErrorCode.INVALID_CREDENTIALS,
        'Invalid email or password'
      );
    }
  }

  validateSignUpData(data: SignUpData): void {
    // Email validation
    if (!data.email) {
      throw new AuthError(
        AuthErrorCode.INVALID_EMAIL,
        'Email is required'
      );
    }

    if (!this.isValidEmail(data.email)) {
      throw new AuthError(
        AuthErrorCode.INVALID_EMAIL,
        'Please enter a valid email address'
      );
    }

    // Password validation
    this.validatePassword(data.password);

    // Full name validation
    if (!data.fullName || data.fullName.trim().length < 2) {
      throw new AuthError(
        AuthErrorCode.INVALID_CREDENTIALS,
        'Please enter your full name'
      );
    }

    // Phone number validation (optional)
    if (data.phoneNumber && !this.isValidPhoneNumber(data.phoneNumber)) {
      throw new AuthError(
        AuthErrorCode.INVALID_CREDENTIALS,
        'Please enter a valid phone number'
      );
    }

    // Role validation
    const validRoles = ['customer', 'restaurant', 'driver'];
    if (!data.role || !validRoles.includes(data.role)) {
      throw new AuthError(
        AuthErrorCode.INVALID_CREDENTIALS,
        'Please select a valid role'
      );
    }

    // Terms acceptance
    if (!data.acceptedTerms) {
      throw new AuthError(
        AuthErrorCode.TERMS_NOT_ACCEPTED,
        'You must accept the terms and conditions'
      );
    }
  }

  validatePassword(password: string): void {
    if (!password) {
      throw new AuthError(
        AuthErrorCode.WEAK_PASSWORD,
        'Password is required'
      );
    }

    const errors: string[] = [];

    if (password.length < 8) {
      errors.push('at least 8 characters');
    }

    if (!/[A-Z]/.test(password)) {
      errors.push('one uppercase letter');
    }

    if (!/[a-z]/.test(password)) {
      errors.push('one lowercase letter');
    }

    if (!/[0-9]/.test(password)) {
      errors.push('one number');
    }

    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      errors.push('one special character');
    }

    if (errors.length > 0) {
      throw new AuthError(
        AuthErrorCode.WEAK_PASSWORD,
        `Password must contain ${errors.join(', ')}`
      );
    }
  }

  isValidEmail(email: string): boolean {
    return this.emailRegex.test(email.trim());
  }

  isValidPhoneNumber(phone: string): boolean {
    return this.phoneRegex.test(phone.replace(/\s/g, ''));
  }

  sanitizeEmail(email: string): string {
    return email.trim().toLowerCase();
  }

  sanitizePhoneNumber(phone: string): string {
    return phone.replace(/\s/g, '').replace(/[^\d+]/g, '');
  }
}
