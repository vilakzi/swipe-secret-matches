
import * as React from 'react';
import { createContext, useContext, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

// Type definitions
interface AuthContextType {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, displayName: string, userType: string) => Promise<void>;
  signOut: () => Promise<void>;
}

interface EnhancedAuthProviderProps {
  children: ReactNode;
}

// Create context with default value
const EnhancedAuthContext = createContext<AuthContextType | null>(null);

// Provider component with proper session handling
export const EnhancedAuthProvider: React.FC<EnhancedAuthProviderProps> = ({ children }) => {
  const [user, setUser] = React.useState<User | null>(null);
  const [session, setSession] = React.useState<Session | null>(null);
  const [isLoading, setIsLoading] = React.useState<boolean>(true);

  // Initialize auth state
  React.useEffect(() => {
    console.log('Enhanced Auth: Initializing auth state');
    
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Enhanced Auth state changed:', event, session?.user?.email);
        setSession(session);
        setUser(session?.user ?? null);
        setIsLoading(false);
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log('Enhanced Auth: Initial session check', session?.user?.email);
      setSession(session);
      setUser(session?.user ?? null);
      setIsLoading(false);
    });

    return () => {
      console.log('Enhanced Auth: Cleaning up auth listener');
      subscription.unsubscribe();
    };
  }, []);

  const signIn = React.useCallback(async (email: string, password: string) => {
    console.log('Enhanced Auth: Signing in user');
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      console.error('Enhanced Auth: Sign in error', error);
      throw error;
    }
  }, []);

  const signUp = React.useCallback(async (email: string, password: string, displayName: string, userType: string) => {
    console.log('Enhanced Auth: Signing up user');
    const redirectUrl = `${window.location.origin}/`;
    
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: {
          display_name: displayName,
          user_type: userType
        }
      }
    });

    if (error) {
      console.error('Enhanced Auth: Sign up error', error);
      throw error;
    }
  }, []);

  const signOut = React.useCallback(async () => {
    console.log('Enhanced Auth: Signing out user');
    const { error } = await supabase.auth.signOut();
    
    if (error) {
      console.error('Enhanced Auth: Sign out error', error);
      throw error;
    }
  }, []);

  const contextValue = React.useMemo(() => ({
    user,
    session,
    isLoading,
    isAuthenticated: !!user,
    signIn,
    signUp,
    signOut,
  }), [user, session, isLoading, signIn, signUp, signOut]);

  return (
    <EnhancedAuthContext.Provider value={contextValue}>
      {children}
    </EnhancedAuthContext.Provider>
  );
};

// Custom hook with error handling
export const useEnhancedAuth = (): AuthContextType => {
  const context = useContext(EnhancedAuthContext);
  
  if (!context) {
    throw new Error(
      'useEnhancedAuth must be used within an EnhancedAuthProvider. ' +
      'Make sure your component is wrapped with <EnhancedAuthProvider>.'
    );
  }
  
  return context;
};

// Export context for advanced usage
export { EnhancedAuthContext };
