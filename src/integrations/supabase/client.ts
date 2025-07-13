import { createClient } from '@supabase/supabase-js';
import { toast } from '@/components/ui/use-toast';
import type { Database } from './types';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  const missingVars = [];
  if (!SUPABASE_URL) missingVars.push('VITE_SUPABASE_URL');
  if (!SUPABASE_ANON_KEY) missingVars.push('VITE_SUPABASE_ANON_KEY');
  
  const errorMessage = `Missing required environment variables: ${missingVars.join(', ')}`;
  console.error(errorMessage);
  
  if (typeof window !== 'undefined') {
    toast({
      title: 'Configuration Error',
      description: 'Application is not properly configured. Please check your environment variables.',
      variant: 'destructive',
    });
  }
  
  throw new Error(errorMessage);
}

const options = {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  },
  global: {
    headers: {
      'x-application-name': 'connectsbuddy'
    }
  },
  realtime: {
    params: {
      eventsPerSecond: 10
    }
  }
};

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY, options);

// Add error event listener
supabase.auth.onAuthStateChange((event, session) => {
  if (event === 'TOKEN_REFRESHED') {
    console.log('Supabase token refreshed successfully');
  } else if (event === 'SIGNED_OUT') {
    console.log('User signed out');
    localStorage.removeItem('sb-refresh-token');
  } else if (event === 'USER_DELETED') {
    console.log('User account deleted');
    localStorage.clear();
  }
});

// Handle storage errors
supabase.storage.onError((error) => {
  console.error('Supabase storage error:', error);
  toast({
    title: 'Storage Error',
    description: 'Failed to handle file operation. Please try again.',
    variant: 'destructive',
  });
});

// Add network error handling
window.addEventListener('online', () => {
  console.log('Network connection restored');
  toast({
    title: 'Connected',
    description: 'Network connection restored',
  });
});

window.addEventListener('offline', () => {
  console.log('Network connection lost');
  toast({
    title: 'Disconnected',
    description: 'Please check your internet connection',
    variant: 'destructive',
  });
});