# Authentication Service API Documentation

## Overview

The authentication service provides a comprehensive solution for user authentication, session management, and security features in the food delivery app.

## Architecture

```
┌─────────────────┐
│   AuthProvider  │ ← React Context
├─────────────────┤
│   AuthService   │ ← Main Service (Singleton)
├─────────────────┤
│ IAuthRepository │ ← Interface
├─────────────────┤
│SupabaseAuthRepo│ ← Implementation
└─────────────────┘
```

## Core Services

### AuthService

The main authentication service that orchestrates all auth operations.

```typescript
import { authService } from '@/services/auth/AuthService';
```

#### Methods

##### signIn(data: SignInData): Promise<AuthSession>

Signs in a user with email and password.

```typescript
const session = await authService.signIn({
  email: 'user@example.com',
  password: 'password123',
  rememberMe: true,
  deviceInfo: {
    id: 'device-123',
    name: 'iPhone 12',
    platform: 'ios',
    osVersion: '15.0',
    appVersion: '1.0.0',
  }
});
```

##### signUp(data: SignUpData): Promise<AuthSession>

Registers a new user.

```typescript
const session = await authService.signUp({
  email: 'user@example.com',
  password: 'SecurePass123!',
  fullName: 'John Doe',
  phoneNumber: '+1234567890',
  role: 'customer',
  acceptedTerms: true,
  marketingConsent: false,
});
```

##### signOut(): Promise<void>

Signs out the current user.

```typescript
await authService.signOut();
```

##### getCurrentSession(): Promise<AuthSession | null>

Gets the current authenticated session.

```typescript
const session = await authService.getCurrentSession();
if (session) {
  console.log('User:', session.user);
  console.log('Token expires in:', session.tokens.expiresIn);
}
```

##### refreshSession(): Promise<AuthSession | null>

Refreshes the current session tokens.

```typescript
const newSession = await authService.refreshSession();
```

##### updateProfile(updates: Partial<User>): Promise<User>

Updates the current user's profile.

```typescript
const updatedUser = await authService.updateProfile({
  fullName: 'Jane Doe',
  phoneNumber: '+0987654321',
});
```

##### resetPassword(email: string): Promise<void>

Sends a password reset email.

```typescript
await authService.resetPassword('user@example.com');
```

##### onAuthStateChange(callback): () => void

Subscribes to authentication state changes.

```typescript
const unsubscribe = authService.onAuthStateChange((event) => {
  switch (event.type) {
    case 'SIGNED_IN':
      console.log('User signed in:', event.session?.user);
      break;
    case 'SIGNED_OUT':
      console.log('User signed out');
      break;
    case 'SESSION_EXPIRED':
      console.log('Session expired');
      break;
  }
});

// Cleanup
unsubscribe();
```

## React Hook

### useAuth()

React hook for accessing authentication state and methods.

```typescript
import { useAuth } from '@/hooks/useAuth';

function MyComponent() {
  const { 
    user, 
    session,
    loading, 
    initialized,
    error,
    signIn, 
    signOut 
  } = useAuth();

  if (loading) return <LoadingSpinner />;
  if (!user) return <LoginScreen />;
  
  return <AuthenticatedContent user={user} />;
}
```

## Types

### User

```typescript
interface User {
  id: string;
  email: string;
  fullName: string;
  phoneNumber?: string;
  role: UserRole;
  avatar?: string;
  emailVerified?: boolean;
  phoneVerified?: boolean;
  createdAt: string;
  updatedAt: string;
  lastLoginAt?: string;
  preferences?: UserPreferences;
  metadata?: Record<string, any>;
}
```

### AuthSession

```typescript
interface AuthSession {
  user: User;
  tokens: AuthTokens;
  sessionId: string;
  deviceInfo?: DeviceInfo;
}
```

### AuthError

```typescript
class AuthError extends Error {
  code: AuthErrorCode;
  message: string;
  details?: any;
}

enum AuthErrorCode {
  INVALID_CREDENTIALS = 'INVALID_CREDENTIALS',
  USER_NOT_FOUND = 'USER_NOT_FOUND',
  EMAIL_NOT_VERIFIED = 'EMAIL_NOT_VERIFIED',
  ACCOUNT_DISABLED = 'ACCOUNT_DISABLED',
  ACCOUNT_LOCKED = 'ACCOUNT_LOCKED',
  EMAIL_ALREADY_EXISTS = 'EMAIL_ALREADY_EXISTS',
  WEAK_PASSWORD = 'WEAK_PASSWORD',
  SESSION_EXPIRED = 'SESSION_EXPIRED',
  NETWORK_ERROR = 'NETWORK_ERROR',
  // ... more codes
}
```

## Error Handling

### Example Error Handling

```typescript
try {
  await authService.signIn({ email, password });
} catch (error) {
  if (error instanceof AuthError) {
    switch (error.code) {
      case AuthErrorCode.INVALID_CREDENTIALS:
        showError('Invalid email or password');
        break;
        
      case AuthErrorCode.ACCOUNT_LOCKED:
        showError('Account is locked. Please try again later.');
        break;
        
      case AuthErrorCode.NETWORK_ERROR:
        showError('Network error. Please check your connection.');
        break;
        
      default:
        showError(error.message);
    }
  } else {
    showError('An unexpected error occurred');
  }
}
```

## Security Features

### Rate Limiting

The service automatically implements rate limiting for login attempts:

- Maximum 5 failed attempts
- 30-minute lockout period
- Automatic unlock after lockout expires

### Password Requirements

- Minimum 8 characters
- At least one uppercase letter
- At least one lowercase letter
- At least one number
- At least one special character

### Session Management

- Automatic session refresh before expiration
- Session monitoring every 5 minutes
- Secure token storage
- Device tracking (optional)

## Best Practices

### 1. Always Handle Errors

```typescript
const handleLogin = async () => {
  try {
    await signIn({ email, password });
    navigation.navigate('Home');
  } catch (error) {
    // Always handle errors appropriately
    handleAuthError(error);
  }
};
```

### 2. Check Session Validity

```typescript
useEffect(() => {
  const checkAuth = async () => {
    const session = await authService.getCurrentSession();
    if (!session) {
      navigation.navigate('Login');
    }
  };
  
  checkAuth();
}, []);
```

### 3. Clean Up Subscriptions

```typescript
useEffect(() => {
  const unsubscribe = authService.onAuthStateChange((event) => {
    // Handle auth changes
  });
  
  return () => unsubscribe();
}, []);
```

### 4. Validate Input

```typescript
const validator = new AuthValidator();

try {
  validator.validatePassword(password);
  // Proceed with sign up
} catch (error) {
  showError(error.message);
}
```

## Testing

### Mock Authentication

```typescript
// Create mock repository for testing
class MockAuthRepository implements IAuthRepository {
  async signIn(data: SignInData): Promise<AuthSession> {
    // Return mock session
  }
  // ... implement other methods
}

// Use in tests
const mockAuth = AuthService.getInstance(new MockAuthRepository());
```

## Performance Considerations

1. **Caching**: Sessions are cached to reduce API calls
2. **Retry Logic**: Failed requests retry up to 3 times
3. **Debouncing**: Auth state changes are debounced
4. **Lazy Loading**: User profiles load on demand

## Troubleshooting

### Common Issues

1. **Session Expired**
   - The service automatically attempts to refresh
   - If refresh fails, user is signed out

2. **Network Errors**
   - Automatic retry with exponential backoff
   - Offline mode for cached sessions

3. **Rate Limiting**
   - Wait for lockout period to expire
   - Contact support for immediate unlock

### Debug Mode

Enable debug logging:

```typescript
if (__DEV__) {
  logger.setLevel('debug');
}
```
