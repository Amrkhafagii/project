import { createClient } from '@supabase/supabase-js';
import Constants from 'expo-constants';
import { Platform } from 'react-native';

// Get Supabase URL and anon key from Constants or app.json config
const supabaseUrl = 
  Constants.expoConfig?.extra?.supabaseUrl || 
  'https://zcqsacyaboghebsboeys.supabase.co';

const supabaseAnonKey = 
  Constants.expoConfig?.extra?.supabaseAnonKey || 
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpjcXNhY3lhYm9naGVic2JvZXlzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAzMzU2NjEsImV4cCI6MjA2NTkxMTY2MX0.CXpMS-CAT2f2hzvxC4uiJF6kVyPDoXnqixp0QlmAhlo';

// Configure Supabase client with platform-specific settings
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false, // Important for mobile
  },
  // Add global error handler for network requests
  global: {
    fetch: async (url, options) => {
      try {
        const response = await fetch(url, options);
        return response;
      } catch (error) {
        console.error('Supabase fetch error:', error);
        // Re-throw the error with more context for debugging
        throw new Error(
          `Network request failed: ${error?.message || 'Unknown error'}`
        );
      }
    }
  }
});

// Log Supabase connection info for debugging
console.log(`[Supabase] Connecting to: ${supabaseUrl.substring(0, 30)}... on platform: ${Platform.OS}`);
