import { AuthFormData } from '@/types/auth';
import { validateEmail, validatePassword, validateRequired, validateName } from '@/utils/validation';

type AuthMode = 'login' | 'register' | 'forgot-password';

interface ValidationResult {
  isValid: boolean;
  message: string;
}

export function validateAuthForm(
  formData: AuthFormData, 
  mode: AuthMode
): ValidationResult {
  // Email validation (common for all modes)
  const emailValidation = validateRequired(formData.email, 'Email');
  if (!emailValidation.isValid) {
    return emailValidation;
  }

  if (!validateEmail(formData.email)) {
    return { isValid: false, message: 'Please enter a valid email address' };
  }

  // Mode-specific validation
  switch (mode) {
    case 'login':
      return validateLoginForm(formData);
    
    case 'register':
      return validateRegisterForm(formData);
    
    case 'forgot-password':
      // Email validation is sufficient for forgot password
      return { isValid: true, message: '' };
    
    default:
      return { isValid: false, message: 'Invalid authentication mode' };
  }
}

function validateLoginForm(formData: AuthFormData): ValidationResult {
  const passwordValidation = validateRequired(formData.password || '', 'Password');
  if (!passwordValidation.isValid) {
    return passwordValidation;
  }

  return { isValid: true, message: '' };
}

function validateRegisterForm(formData: AuthFormData): ValidationResult {
  // Full name validation
  const nameValidation = validateName(formData.fullName || '');
  if (!nameValidation.isValid) {
    return nameValidation;
  }

  // Phone number validation
  const phoneValidation = validateRequired(formData.phoneNumber || '', 'Phone number');
  if (!phoneValidation.isValid) {
    return phoneValidation;
  }

  // Password validation
  const passwordValidation = validatePassword(formData.password || '');
  if (!passwordValidation.isValid) {
    return passwordValidation;
  }

  // Confirm password validation
  if (formData.password !== formData.confirmPassword) {
    return { isValid: false, message: 'Passwords do not match' };
  }

  return { isValid: true, message: '' };
}
