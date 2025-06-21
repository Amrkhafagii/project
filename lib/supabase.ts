import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import { logger } from '@/utils/logger';

// Get Supabase configuration
const supabaseUrl = 'https://zcqsacyaboghebsboeys.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpjcXNhY3lhYm9naGVic2JvZXlzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAzMzU2NjEsImV4cCI6MjA2NTkxMTY2MX0.CXpMS-CAT2f2hzvxC4uiJF6kVyPDoXnqixp0QlmAhlo';

// Log initialization
logger.info('Initializing Supabase client', {
  url: supabaseUrl,
  platform: Platform.OS,
  hasAnonKey: !!supabaseAnonKey,
});

// Create Supabase client with enhanced error handling
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
    // Add debug mode for development
    debug: __DEV__,
  },
  // Add global fetch override for better error handling
  global: {
    fetch: async (url, options) => {
      logger.debug('Supabase fetch request', {
        url,
        method: options?.method,
        headers: options?.headers,
      });

      try {
        const response = await fetch(url, options);
        
        logger.debug('Supabase fetch response', {
          url,
          status: response.status,
          ok: response.ok,
        });

        return response;
      } catch (error) {
        logger.error('Supabase fetch error', {
          url,
          error: error instanceof Error ? {
            name: error.name,
            message: error.message,
            stack: error.stack,
          } : error,
        });
        throw error;
      }
    },
  },
});

// Add auth state change listener for debugging
supabase.auth.onAuthStateChange((event, session) => {
  logger.info('Auth state changed', {
    event,
    hasSession: !!session,
    userId: session?.user?.id,
  });
});

// Export the URL for debugging
export const supabaseConfig = {
  url: supabaseUrl,
  anonKey: supabaseAnonKey,
};
