/**
 * services/supabase.ts
 * Supabase client with deep-link auth support for Expo Go.
 */

import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://pmfqodemvrhfgtstsxcw.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBtZnFvZGVtdnJoZmd0c3RzeGN3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg5Mjk0MDcsImV4cCI6MjA5NDUwNTQwN30.rNTCH2yCB4hju-HsZpLhIF7CGj9XRnR7cdEMtjWTbew';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false, // We handle this manually via deep link in _layout.tsx
  },
});
