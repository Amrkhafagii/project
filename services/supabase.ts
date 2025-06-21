import { createClient } from '@supabase/supabase-js';
import Constants from 'expo-constants';

// Get Supabase configuration from environment variables
const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://zcqsacyaboghebsboeys.supabase.co';
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpjcXNhY3lhYm9naGVic2JvZXlzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAzMzU2NjEsImV4cCI6MjA2NTkxMTY2MX0.CXpMS-CAT2f2hzvxC4uiJF6kVyPDoXnqixp0QlmAhlo';

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: {
      getItem: (key: string) => {
        // Use a simple in-memory storage for now
        // In production, use expo-secure-store
        return Promise.resolve(null);
      },
      setItem: (key: string, value: string) => {
        return Promise.resolve();
      },
      removeItem: (key: string) => {
        return Promise.resolve();
      },
    },
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
