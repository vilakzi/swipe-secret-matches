import * as React from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signUp: (email: string, password: string, displayName: string, userType?: 'user' | 'service_provider', isAdmin?: boolean) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = React.createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = React.useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  console.log('AuthProvider: Initializing with React:', React);
  console.log('AuthProvider: React.useState available:', React.useState);
  
  // Initialize state with explicit React namespace
  const [user, setUser] = React.useState<User | null>(null);
  const [session, setSession] = React.useState<Session | null>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    let mounted = true;

    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return;

        console.log('Auth state changed:', event, session?.user?.email || 'signed out');
        
        if (event === 'SIGNED_OUT') {
          setSession(null);
          setUser(null);
          setLoading(false);
          return;
        }

        if (event === 'TOKEN_REFRESHED') {
          console.log('Token refreshed successfully');
        }

        if (session) {
          setSession(session);
          setUser(session.user);
        } else {
          setSession(null);
          setUser(null);
        }
        
        setLoading(false);
      }
    );

    // THEN check for existing session
    const getInitialSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Error getting session:', error);
          const { error: refreshError } = await supabase.auth.refreshSession();
          if (refreshError) {
            console.error('Error refreshing session:', refreshError);
            await supabase.auth.signOut();
          }
          return;
        }

        if (mounted) {
          console.log('Initial session loaded:', session?.user?.email || 'no session');
          setSession(session);
          setUser(session?.user ?? null);
        }
      } catch (error) {
        console.error('Failed to get initial session:', error);
        await supabase.auth.signOut();
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    getInitialSession();

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signUp = async (email: string, password: string, displayName: string, userType: 'user' | 'service_provider' = 'user', isAdmin: boolean = false) => {
    try {
      console.log('SignUp called with:', email, displayName);
      const redirectUrl = `${window.location.origin}/`;
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            display_name: displayName,
            user_type: userType,
            role: isAdmin ? 'admin' : userType,
          },
        },
      });
      
      if (error) {
        console.error('SignUp error:', error);
        throw error;
      }
      
      console.log('SignUp successful:', data.user?.email);
    } catch (error: any) {
      console.error('Sign up error:', error);
      throw error;
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      console.log('SignIn called with:', email);
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) {
        console.error('SignIn error:', error);
        throw error;
      }
      
      console.log('SignIn successful:', data.user?.email);
    } catch (error: any) {
      console.error('Sign in error:', error);
      throw error;
    }
  };

  const signInWithGoogle = async () => {
    try {
      console.log('Google SignIn called');
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/`
        }
      });
      
      if (error) {
        console.error('Google SignIn error:', error);
        throw error;
      }
      
      console.log('Google SignIn initiated successfully');
    } catch (error: any) {
      console.error('Google sign in error:', error);
      throw error;
    }
  };

  const signOut = async () => {
    try {
      setLoading(true);
      console.log('SignOut called');
      
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error('Sign out error:', error);
        throw error;
      }
      
      // Clear state immediately
      setSession(null);
      setUser(null);
      console.log('SignOut successful');
      
    } catch (error: any) {
      console.error('Sign out error:', error);
      // Even if there's an error, clear the local state
      setSession(null);
      setUser(null);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const value = {
    user,
    session,
    loading,
    signUp,
    signIn,
    signInWithGoogle,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};