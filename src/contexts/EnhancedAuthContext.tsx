
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
  loading: boolean; // Add this for compatibility
}

interface EnhancedAuthProviderProps {
  children: ReactNode;
}

// Create context with default value
const EnhancedAuthContext = createContext<AuthContextType | null>(null);

// Provider component with authentication bypass
export const EnhancedAuthProvider: React.FC<EnhancedAuthProviderProps> = ({ children }) => {
  const [user, setUser] = React.useState<User | null>(null);
  const [session, setSession] = React.useState<Session | null>(null);
  const [isLoading, setIsLoading] = React.useState<boolean>(false); // Set to false to bypass loading

  // Mock user for bypass mode
  const mockUser = React.useMemo(() => ({
    id: 'mock-user-id',
    email: 'demo@example.com',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    aud: 'authenticated',
    role: 'authenticated',
    email_confirmed_at: new Date().toISOString(),
    phone: null,
    confirmed_at: new Date().toISOString(),
    last_sign_in_at: new Date().toISOString(),
    app_metadata: {},
    user_metadata: {
      display_name: 'Demo User'
    },
    identities: [],
    factors: []
  } as User), []);

  // Initialize with mock authentication for bypass
  React.useEffect(() => {
    console.log('Enhanced Auth: BYPASS MODE - Setting mock user');
    setUser(mockUser);
    setSession({
      access_token: 'mock-token',
      refresh_token: 'mock-refresh',
      expires_in: 3600,
      expires_at: Date.now() + 3600000,
      token_type: 'bearer',
      user: mockUser
    } as Session);
    setIsLoading(false);
  }, [mockUser]);

  const signIn = React.useCallback(async (email: string, password: string) => {
    console.log('Enhanced Auth: BYPASS MODE - Mock sign in');
    // In bypass mode, just set the mock user
    setUser(mockUser);
    setSession({
      access_token: 'mock-token',
      refresh_token: 'mock-refresh',
      expires_in: 3600,
      expires_at: Date.now() + 3600000,
      token_type: 'bearer',
      user: mockUser
    } as Session);
  }, [mockUser]);

  const signUp = React.useCallback(async (email: string, password: string, displayName: string, userType: string) => {
    console.log('Enhanced Auth: BYPASS MODE - Mock sign up');
    // In bypass mode, just set the mock user
    setUser(mockUser);
    setSession({
      access_token: 'mock-token',
      refresh_token: 'mock-refresh',
      expires_in: 3600,
      expires_at: Date.now() + 3600000,
      token_type: 'bearer',
      user: mockUser
    } as Session);
  }, [mockUser]);

  const signOut = React.useCallback(async () => {
    console.log('Enhanced Auth: BYPASS MODE - Mock sign out');
    // In bypass mode, just clear the mock user
    setUser(null);
    setSession(null);
  }, []);

  const contextValue = React.useMemo(() => ({
    user,
    session,
    isLoading,
    loading: isLoading, // Add this for compatibility
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
