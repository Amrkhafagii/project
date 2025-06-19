export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

export function validateEmail(email: string): ValidationResult {
  const errors: string[] = [];
  
  if (!email) {
    errors.push('Email is required');
  } else {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      errors.push('Please enter a valid email address');
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors,
  };
}

export function validatePassword(password: string): ValidationResult {
  const errors: string[] = [];
  
  if (!password) {
    errors.push('Password is required');
  } else {
    if (password.length < 6) {
      errors.push('Password must be at least 6 characters long');
    }
    if (password.length > 128) {
      errors.push('Password must be less than 128 characters');
    }
    if (!/(?=.*[a-z])/.test(password)) {
      errors.push('Password must contain at least one lowercase letter');
    }
    if (!/(?=.*[A-Z])/.test(password)) {
      errors.push('Password must contain at least one uppercase letter');
    }
    if (!/(?=.*\d)/.test(password)) {
      errors.push('Password must contain at least one number');
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors,
  };
}

export function validatePhoneNumber(phone: string): ValidationResult {
  const errors: string[] = [];
  
  if (!phone) {
    errors.push('Phone number is required');
  } else {
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length !== 10) {
      errors.push('Please enter a valid 10-digit phone number');
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors,
  };
}

export function validateRequired(value: string, fieldName: string): ValidationResult {
  const errors: string[] = [];
  
  if (!value || value.trim().length === 0) {
    errors.push(`${fieldName} is required`);
  }
  
  return {
    isValid: errors.length === 0,
    errors,
  };
}

export function validateMinLength(
  value: string,
  minLength: number,
  fieldName: string
): ValidationResult {
  const errors: string[] = [];
  
  if (value && value.length < minLength) {
    errors.push(`${fieldName} must be at least ${minLength} characters long`);
  }
  
  return {
    isValid: errors.length === 0,
    errors,
  };
}

export function validateMaxLength(
  value: string,
  maxLength: number,
  fieldName: string
): ValidationResult {
  const errors: string[] = [];
  
  if (value && value.length > maxLength) {
    errors.push(`${fieldName} must be less than ${maxLength} characters`);
  }
  
  return {
    isValid: errors.length === 0,
    errors,
  };
}

export function validateNumeric(value: string, fieldName: string): ValidationResult {
  const errors: string[] = [];
  
  if (value && !/^\d+(\.\d+)?$/.test(value)) {
    errors.push(`${fieldName} must be a valid number`);
  }
  
  return {
    isValid: errors.length === 0,
    errors,
  };
}

export function combineValidations(...validations: ValidationResult[]): ValidationResult {
  const allErrors = validations.flatMap(v => v.errors);
  
  return {
    isValid: allErrors.length === 0,
    errors: allErrors,
  };
}
