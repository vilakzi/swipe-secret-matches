
import * as React from 'react';
import { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

const DEBUG_AUTH = true; // Enable debugging
const AUTH_TIMEOUT = 10000; // 10 seconds timeout

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  authError: string | null;
  signOut: () => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, displayName: string, userType: 'user' | 'service_provider') => Promise<void>;
  signInWithProvider: (provider: 'google' | 'github' | 'facebook') => Promise<void>;
  signInWithMagicLink: (email: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  loading: true,
  authError: null,
  signOut: async () => {},
  signIn: async () => {},
  signUp: async () => {},
  signInWithProvider: async () => {},
  signInWithMagicLink: async () => {},
});

export const EnhancedAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    let timeoutId: NodeJS.Timeout;

    if (DEBUG_AUTH) console.log('🔐 Auth initialization started');

    // Set timeout to prevent hanging
    timeoutId = setTimeout(() => {
      if (mounted && loading) {
        console.warn('⚠️ Auth initialization timeout - forcing loading to false');
        setLoading(false);
        setAuthError('Authentication timeout - you can still continue');
      }
    }, AUTH_TIMEOUT);

    const initAuth = async () => {
      try {
        if (DEBUG_AUTH) console.log('🔐 Getting initial session...');
        
        // Test Supabase connection first
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('❌ Auth session error:', error);
          setAuthError(`Session error: ${error.message}`);
        }
        
        if (mounted) {
          if (DEBUG_AUTH) {
            console.log('🔐 Initial session:', session ? 'Found' : 'Not found');
            if (session?.user) console.log('👤 User:', session.user.email);
          }
          
          setSession(session);
          setUser(session?.user ?? null);
          setLoading(false);
          clearTimeout(timeoutId);
        }
      } catch (error) {
        console.error('❌ Auth init error:', error);
        setAuthError(`Init error: ${error instanceof Error ? error.message : 'Unknown error'}`);
        if (mounted) {
          setLoading(false);
          clearTimeout(timeoutId);
        }
      }
    };

    // Test Supabase connection independently
    const testConnection = async () => {
      try {
        if (DEBUG_AUTH) console.log('🔗 Testing Supabase connection...');
        const { data, error } = await supabase.from('profiles').select('count').limit(1);
        if (error) {
          console.warn('⚠️ Supabase connection test failed:', error.message);
        } else {
          if (DEBUG_AUTH) console.log('✅ Supabase connection successful');
        }
      } catch (error) {
        console.warn('⚠️ Supabase connection test error:', error);
      }
    };

    testConnection();
    initAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (mounted) {
          if (DEBUG_AUTH) console.log('🔄 Auth state changed:', event, session ? 'with session' : 'no session');
          setSession(session);
          setUser(session?.user ?? null);
          setLoading(false);
          setAuthError(null); // Clear any previous errors
          clearTimeout(timeoutId);
        }
      }
    );

    return () => {
      mounted = false;
      clearTimeout(timeoutId);
      subscription.unsubscribe();
      if (DEBUG_AUTH) console.log('🧹 Auth cleanup complete');
    };
  }, []);

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
  };

  const signUp = async (email: string, password: string, displayName: string, userType: 'user' | 'service_provider') => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          display_name: displayName,
          user_type: userType,
        },
        emailRedirectTo: `${window.location.origin}/`,
      },
    });
    if (error) throw error;
  };

  const signInWithProvider = async (provider: 'google' | 'github' | 'facebook') => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/`,
      },
    });
    if (error) throw error;
  };

  const signInWithMagicLink = async (email: string) => {
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/`,
      },
    });
    if (error) throw error;
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      session, 
      loading, 
      authError,
      signOut, 
      signIn, 
      signUp,
      signInWithProvider,
      signInWithMagicLink 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useEnhancedAuth = () => {
  return useContext(AuthContext);
};
