import { createClient } from '@supabase/supabase-js';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Get Supabase URL and anon key from environment variables
const supabaseUrl = 'https://zcqsacyaboghebsboeys.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpjcXNhY3lhYm9naGVic2JvZXlzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAzMzU2NjEsImV4cCI6MjA2NTkxMTY2MX0.CXpMS-CAT2f2hzvxC4uiJF6kVyPDoXnqixp0QlmAhlo';

// Special handling for iOS/Android
const isPlatformNative = Platform.OS === 'ios' || Platform.OS === 'android';

// Configure Supabase client with platform-specific settings
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
    // Use AsyncStorage for session persistence on mobile platforms
    storage: isPlatformNative ? {
      getItem: async (key) => {
        try {
          const value = await AsyncStorage.getItem(key);
          return value;
        } catch (error) {
          console.error('[Supabase] AsyncStorage getItem error:', error);
          return null;
        }
      },
      setItem: async (key, value) => {
        try {
          await AsyncStorage.setItem(key, value);
        } catch (error) {
          console.error('[Supabase] AsyncStorage setItem error:', error);
        }
      },
      removeItem: async (key) => {
        try {
          await AsyncStorage.removeItem(key);
        } catch (error) {
          console.error('[Supabase] AsyncStorage removeItem error:', error);
        }
      },
    } : undefined,
  },
  global: {
    headers: {
      'X-Client-Info': 'food-delivery-app',
    },
    // Add fetch configuration for better error handling
    fetch: (url, options = {}) => {
      return fetch(url, {
        ...options,
        // Add timeout for network requests
        signal: AbortSignal.timeout(30000), // 30 second timeout
      }).catch((error) => {
        console.error('[Supabase] Fetch error:', error);
        throw error;
      });
    },
  },
});

// Test connection on initialization
supabase.auth.getSession()
  .then(({ data, error }) => {
    if (error) {
      console.error('[Supabase] Initial connection test failed:', error);
    } else {
      console.log('[Supabase] Connection successful, session:', data.session ? 'exists' : 'none');
    }
  })
  .catch((error) => {
    console.error('[Supabase] Connection test error:', error);
  });

// Log Supabase connection info for debugging
console.log(`[Supabase] Initialized client for platform: ${Platform.OS}`);
console.log(`[Supabase] URL: ${supabaseUrl}`);
