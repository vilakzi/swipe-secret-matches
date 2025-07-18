
import * as React from 'react';
import { createContext, useContext, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import toast from 'react-hot-toast';

console.log('EnhancedAuthContext module loading');

// Type definitions
interface AuthContextType {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  loading: boolean; // Add this for compatibility
  isAuthenticated: boolean;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, displayName: string, userType: 'user' | 'service_provider') => Promise<void>;
  signInWithProvider: (provider: 'google' | 'github' | 'facebook') => Promise<void>;
  signInWithMagicLink: (email: string) => Promise<void>;
}

interface EnhancedAuthProviderProps {
  children: ReactNode;
}

// Create context with default value
const EnhancedAuthContext = createContext<AuthContextType | null>(null);

// Provider component with real Google OAuth
export const EnhancedAuthProvider: React.FC<EnhancedAuthProviderProps> = ({ children }) => {
  console.log('EnhancedAuthProvider rendering');
  
  const [user, setUser] = React.useState<User | null>(null);
  const [session, setSession] = React.useState<Session | null>(null);
  const [isLoading, setIsLoading] = React.useState<boolean>(true);

  // Initialize authentication state
  React.useEffect(() => {
    console.log('Enhanced Auth: Initializing real authentication');

    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log('Auth state changed:', event, session?.user?.email);
        setSession(session);
        setUser(session?.user ?? null);
        setIsLoading(false);
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log('Initial session check:', session?.user?.email);
      setSession(session);
      setUser(session?.user ?? null);
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signInWithGoogle = React.useCallback(async () => {
    console.log('Enhanced Auth: Starting Google sign in');
    setIsLoading(true);
    
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/`
        }
      });
      
      if (error) {
        console.error('Google sign in error:', error);
        toast.error(error.message || 'Failed to sign in with Google');
        throw error;
      }
    } catch (error) {
      console.error('Sign in failed:', error);
      setIsLoading(false);
      throw error;
    }
  }, []);

  const signOut = React.useCallback(async () => {
    console.log('Enhanced Auth: Signing out');
    setIsLoading(true);
    
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('Sign out error:', error);
        toast.error(error.message || 'Failed to sign out');
        throw error;
      }
      toast.success('Signed out successfully');
    } catch (error) {
      console.error('Sign out failed:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const signIn = React.useCallback(async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) {
        toast.error(error.message || 'Failed to sign in');
        throw error;
      }
    } catch (error) {
      console.error('Sign in failed:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const signUp = React.useCallback(async (email: string, password: string, displayName: string, userType: 'user' | 'service_provider') => {
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            display_name: displayName,
            user_type: userType,
          },
          emailRedirectTo: `${window.location.origin}/`
        }
      });
      
      if (error) {
        toast.error(error.message || 'Failed to sign up');
        throw error;
      }
    } catch (error) {
      console.error('Sign up failed:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const signInWithProvider = React.useCallback(async (provider: 'google' | 'github' | 'facebook') => {
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/`
        }
      });
      
      if (error) {
        toast.error(error.message || `Failed to sign in with ${provider}`);
        throw error;
      }
    } catch (error) {
      console.error(`${provider} sign in failed:`, error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const signInWithMagicLink = React.useCallback(async (email: string) => {
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/`
        }
      });
      
      if (error) {
        toast.error(error.message || 'Failed to send magic link');
        throw error;
      }
    } catch (error) {
      console.error('Magic link failed:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const contextValue = React.useMemo(() => {
    const value = {
      user,
      session,
      isLoading,
      loading: isLoading, // Add this for compatibility
      isAuthenticated: !!user,
      signInWithGoogle,
      signOut,
      signIn,
      signUp,
      signInWithProvider,
      signInWithMagicLink,
    };
    console.log('EnhancedAuth context value:', value);
    return value;
  }, [user, session, isLoading, signInWithGoogle, signOut, signIn, signUp, signInWithProvider, signInWithMagicLink]);

  return (
    <EnhancedAuthContext.Provider value={contextValue}>
      {children}
    </EnhancedAuthContext.Provider>
  );
};

// Custom hook with error handling
export const useEnhancedAuth = (): AuthContextType => {
  console.log('useEnhancedAuth called');
  const context = useContext(EnhancedAuthContext);
  
  if (!context) {
    const error = new Error(
      'useEnhancedAuth must be used within an EnhancedAuthProvider. ' +
      'Make sure your component is wrapped with <EnhancedAuthProvider>.'
    );
    console.error(error);
    throw error;
  }
  
  console.log('useEnhancedAuth returning context:', context);
  return context;
};

// Export context for advanced usage
export { EnhancedAuthContext };

console.log('EnhancedAuthContext module loaded');
