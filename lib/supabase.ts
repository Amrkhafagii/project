import { createClient } from '@supabase/supabase-js';
import Constants from 'expo-constants';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Get Supabase URL and anon key from Constants or app.json config
const supabaseUrl = 
  Constants.expoConfig?.extra?.supabaseUrl || 
  'https://zcqsacyaboghebsboeys.supabase.co';

const supabaseAnonKey = 
  Constants.expoConfig?.extra?.supabaseAnonKey || 
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpjcXNhY3lhYm9naGVic2JvZXlzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAzMzU2NjEsImV4cCI6MjA2NTkxMTY2MX0.CXpMS-CAT2f2hzvxC4uiJF6kVyPDoXnqixp0QlmAhlo';

// Special handling for iOS/Android
const isPlatformNative = Platform.OS === 'ios' || Platform.OS === 'android';

// Configure Supabase client with platform-specific settings
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    debug: __DEV__, // Enable auth debugging in development
    autoRefreshToken: true,
    persistSession: true,
    // Use AsyncStorage for session persistence on mobile platforms
    storage: isPlatformNative ? {
      getItem: (key) => AsyncStorage.getItem(key),
      setItem: (key, value) => AsyncStorage.setItem(key, value),
      removeItem: (key) => AsyncStorage.removeItem(key),
    } : undefined,
    detectSessionInUrl: false, // Important for mobile
  },
});

// Log Supabase connection info for debugging
console.log(`[Supabase] Connecting to: ${supabaseUrl.substring(0, 30)}... on platform: ${Platform.OS}`);
