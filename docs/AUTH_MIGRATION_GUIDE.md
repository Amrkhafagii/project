# Authentication Service Migration Guide

## Overview

This guide provides instructions for migrating from the old authentication service to the new refactored version. The refactoring introduces improved security, better error handling, and a more maintainable architecture.

## Breaking Changes

### 1. Error Handling

**Old:**
```typescript
const { error } = await authService.signIn(email, password);
if (error) {
  // Handle error
}
```

**New:**
```typescript
try {
  await authService.signIn({ email, password });
} catch (error) {
  if (error instanceof AuthError) {
    switch (error.code) {
      case AuthErrorCode.INVALID_CREDENTIALS:
        // Handle invalid credentials
        break;
      case AuthErrorCode.NETWORK_ERROR:
        // Handle network error
        break;
    }
  }
}
```

### 2. Sign Up Data Structure

**Old:**
```typescript
await authService.signUp(email, password, {
  fullName,
  phoneNumber,
  role,
});
```

**New:**
```typescript
await authService.signUp({
  email,
  password,
  fullName,
  phoneNumber,
  role,
  acceptedTerms: true, // Now required
  marketingConsent: false, // Optional
});
```

### 3. User Type Changes

The `User` type has been updated with new fields:

```typescript
interface User {
  id: string;
  email: string;
  fullName: string; // Changed from separate firstName/lastName
  phoneNumber?: string;
  role: UserRole;
  avatar?: string;
  emailVerified?: boolean; // New
  phoneVerified?: boolean; // New
  createdAt: string;
  updatedAt: string;
  lastLoginAt?: string; // New
  preferences?: UserPreferences; // New
  metadata?: Record<string, any>; // New
}
```

### 4. AuthContext Changes

The `AuthContext` now provides additional state:

```typescript
interface AuthContextType {
  user: User | null;
  session: AuthSession | null; // New
  loading: boolean;
  initialized: boolean; // New
  error: AuthError | null; // New
  // ... methods
}
```

## Migration Steps

### Step 1: Update Dependencies

```bash
npm install @react-native-async-storage/async-storage
```

### Step 2: Update Database Schema

Run the provided migration:

```bash
npx supabase migration up
```

### Step 3: Update Import Paths

```typescript
// Old
import { authService } from '@/services/auth/authService';
import { useAuth } from '@/services/auth/useAuth';

// New
import { authService } from '@/services/auth/AuthService';
import { useAuth } from '@/hooks/useAuth';
```

### Step 4: Update Error Handling

Replace all error handling code to use the new `AuthError` type and error codes.

### Step 5: Update Sign Up Forms

Add the required `acceptedTerms` field to your sign up forms:

```tsx
const handleSignUp = async () => {
  try {
    await signUp({
      email,
      password,
      fullName,
      phoneNumber,
      role,
      acceptedTerms: termsAccepted, // Add this
      marketingConsent: marketingOptIn, // Optional
    });
  } catch (error) {
    // Handle error
  }
};
```

### Step 6: Update User Profile Access

```typescript
// Old
const name = `${user.firstName} ${user.lastName}`;

// New
const name = user.fullName;
```

## New Features

### 1. Session Management

```typescript
// Get current session
const session = await authService.getCurrentSession();

// Refresh session
await authService.refreshSession();

// Listen to auth events
const unsubscribe = authService.onAuthStateChange((event) => {
  console.log('Auth event:', event.type);
});
```

### 2. Enhanced Security

- Automatic rate limiting for login attempts
- Account lockout after failed attempts
- Session expiration and refresh
- Device tracking (coming soon)

### 3. Better Error Information

```typescript
try {
  await authService.signIn({ email, password });
} catch (error) {
  if (error instanceof AuthError) {
    console.log('Error code:', error.code);
    console.log('Error message:', error.message);
    console.log('Error details:', error.details);
  }
}
```

### 4. Password Validation

The new service includes built-in password validation:

```typescript
// Passwords must now have:
// - At least 8 characters
// - One uppercase letter
// - One lowercase letter
// - One number
// - One special character
```

## Performance Improvements

1. **Caching**: Sessions are now cached for better performance
2. **Retry Logic**: Network requests automatically retry on failure
3. **Optimized API Calls**: Reduced number of sequential API calls

## Security Enhancements

1. **Rate Limiting**: Prevents brute force attacks
2. **Session Monitoring**: Automatic session validation and refresh
3. **Input Sanitization**: All inputs are sanitized before processing
4. **Secure Token Generation**: Uses cryptographically secure methods

## Rollback Plan

If you need to rollback:

1. Revert code changes
2. Keep the database migrations (they're backward compatible)
3. Clear app cache to remove new session data

## Support

For questions or issues during migration:

1. Check error logs for specific error codes
2. Verify all required fields are provided
3. Ensure database migrations have run successfully
4. Clear app cache if experiencing session issues
