import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || 'https://ohwuhkbhdrliqupqtoaz.supabase.co';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9od3Voa2JoZHJsaXF1cHF0b2F6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI5NzU4NDYsImV4cCI6MjA3ODU1MTg0Nn0.16JLvvj1RJo4vVvrFqB7JOZL1u-hWTm1AvZZijhJOpk';

console.log('Supabase URL:', supabaseUrl);
console.log('Supabase Anon Key:', supabaseAnonKey ? 'Set' : 'Missing');
console.log('Platform:', Platform.OS);

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    flowType: 'pkce',
  },
  global: {
    headers: {
      'x-client-info': 'supabase-js-react-native',
      'apikey': supabaseAnonKey,
    },
  },
});

export async function testSupabaseConnection(): Promise<{ success: boolean; error?: string }> {
  try {
    console.log('[Supabase Test] Testing connection to:', supabaseUrl);
    
    const timeoutPromise = new Promise<never>((_, reject) => 
      setTimeout(() => reject(new Error('Connection timeout')), 5000)
    );
    
    const fetchPromise = supabase
      .from('profiles')
      .select('count')
      .limit(1)
      .maybeSingle();
    
    const { error } = await Promise.race([fetchPromise, timeoutPromise]);
    
    if (error && error.code !== 'PGRST116') {
      console.error('[Supabase Test] Connection test failed:', error);
      return { success: false, error: error.message };
    }
    
    console.log('[Supabase Test] Connection successful');
    return { success: true };
  } catch (error) {
    console.error('[Supabase Test] Connection test exception:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    if (errorMessage.includes('Network request failed') || 
        errorMessage.includes('timeout') ||
        errorMessage.includes('Failed to fetch')) {
      return { 
        success: false, 
        error: 'Unable to reach server. The database might be paused or unreachable.'
      };
    }
    
    return { 
      success: false, 
      error: errorMessage
    };
  }
}

const SIGNUP_ATTEMPTS_KEY = '@signup_attempts';
const RATE_LIMIT_DURATION = 5 * 60 * 1000;

export async function checkSignupRateLimit(): Promise<{ allowed: boolean; waitTimeMs?: number }> {
  try {
    const attemptsData = await AsyncStorage.getItem(SIGNUP_ATTEMPTS_KEY);
    if (!attemptsData) {
      return { allowed: true };
    }

    let parsed;
    try {
      parsed = JSON.parse(attemptsData);
    } catch (parseError) {
      console.error('Error parsing rate limit data, clearing:', parseError);
      await AsyncStorage.removeItem(SIGNUP_ATTEMPTS_KEY);
      return { allowed: true };
    }

    const { count, firstAttemptTime } = parsed;
    const now = Date.now();
    const timePassed = now - firstAttemptTime;

    if (timePassed > RATE_LIMIT_DURATION) {
      await AsyncStorage.removeItem(SIGNUP_ATTEMPTS_KEY);
      return { allowed: true };
    }

    if (count >= 3) {
      const waitTimeMs = RATE_LIMIT_DURATION - timePassed;
      return { allowed: false, waitTimeMs };
    }

    return { allowed: true };
  } catch (error) {
    console.error('Error checking rate limit:', error);
    await AsyncStorage.removeItem(SIGNUP_ATTEMPTS_KEY);
    return { allowed: true };
  }
}

export async function recordSignupAttempt(): Promise<void> {
  try {
    const attemptsData = await AsyncStorage.getItem(SIGNUP_ATTEMPTS_KEY);
    const now = Date.now();

    if (!attemptsData) {
      await AsyncStorage.setItem(
        SIGNUP_ATTEMPTS_KEY,
        JSON.stringify({ count: 1, firstAttemptTime: now })
      );
      return;
    }

    let parsed;
    try {
      parsed = JSON.parse(attemptsData);
    } catch (parseError) {
      console.error('Error parsing rate limit data, resetting:', parseError);
      await AsyncStorage.setItem(
        SIGNUP_ATTEMPTS_KEY,
        JSON.stringify({ count: 1, firstAttemptTime: now })
      );
      return;
    }

    const { count, firstAttemptTime } = parsed;
    const timePassed = now - firstAttemptTime;

    if (timePassed > RATE_LIMIT_DURATION) {
      await AsyncStorage.setItem(
        SIGNUP_ATTEMPTS_KEY,
        JSON.stringify({ count: 1, firstAttemptTime: now })
      );
    } else {
      await AsyncStorage.setItem(
        SIGNUP_ATTEMPTS_KEY,
        JSON.stringify({ count: count + 1, firstAttemptTime })
      );
    }
  } catch (error) {
    console.error('Error recording signup attempt:', error);
    await AsyncStorage.removeItem(SIGNUP_ATTEMPTS_KEY);
  }
}

export async function clearSignupAttempts(): Promise<void> {
  try {
    await AsyncStorage.removeItem(SIGNUP_ATTEMPTS_KEY);
  } catch (error) {
    console.error('Error clearing signup attempts:', error);
  }
}
