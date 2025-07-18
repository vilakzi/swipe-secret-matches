
import * as React from 'react';
import { createContext, useContext, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

console.log('EnhancedAuthContext module loading');

// Type definitions
interface AuthContextType {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  loading: boolean; // Add this for compatibility
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
        throw error;
      }
    } catch (error) {
      console.error('Sign out failed:', error);
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
    };
    console.log('EnhancedAuth context value:', value);
    return value;
  }, [user, session, isLoading, signInWithGoogle, signOut]);

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
