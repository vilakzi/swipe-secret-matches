import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session, AuthError } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export type AuthProvider = 'email' | 'google' | 'facebook' | 'github' | 'apple';

interface EnhancedAuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signUp: (email: string, password: string, displayName: string, userType?: 'user' | 'service_provider') => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signInWithProvider: (provider: Exclude<AuthProvider, 'email'>) => Promise<void>;
  signInWithMagicLink: (email: string) => Promise<void>;
  signOut: () => Promise<void>;
  sendPasswordReset: (email: string) => Promise<void>;
  updateProfile: (updates: { display_name?: string; user_type?: 'user' | 'service_provider' }) => Promise<void>;
}

const EnhancedAuthContext = createContext<EnhancedAuthContextType | undefined>(undefined);

export const useEnhancedAuth = () => {
  const context = useContext(EnhancedAuthContext);
  if (context === undefined) {
    throw new Error('useEnhancedAuth must be used within an EnhancedAuthProvider');
  }
  return context;
};

export const EnhancedAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    // Set up auth state listener with error handling
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return;

        try {
          console.log('Enhanced Auth state changed:', event, session?.user?.email || 'signed out');
          
          if (session) {
            setSession(session);
            setUser(session.user);
            
            // Handle new user profile creation
            if (event === 'SIGNED_IN' && session.user) {
              setTimeout(() => {
                handleUserProfile(session.user).catch(error => {
                  console.error('Error handling user profile:', error);
                });
              }, 0);
            }
          } else {
            setSession(null);
            setUser(null);
          }
        } catch (error) {
          console.error('Error in auth state change handler:', error);
        } finally {
          setLoading(false);
        }
      }
    );

    // Get initial session with error handling
    const getInitialSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Error getting session:', error);
          return;
        }

        if (mounted) {
          setSession(session);
          setUser(session?.user ?? null);
        }
      } catch (error) {
        console.error('Failed to get initial session:', error);
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

  const handleUserProfile = async (user: User) => {
    try {
      // Check if profile exists
      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', user.id)
        .single();

      if (!existingProfile) {
        // Create profile for new user
        const displayName = user.user_metadata?.display_name || 
                           user.user_metadata?.full_name || 
                           user.email?.split('@')[0] || 
                           'User';

        const { error: profileError } = await supabase
          .from('profiles')
          .insert({
            id: user.id,
            display_name: displayName,
            user_type: 'user',
            role: 'user'
          });

        if (profileError) {
          console.error('Error creating profile:', profileError);
        }
      }
    } catch (error) {
      console.error('Error handling user profile:', error);
    }
  };

  const signUp = async (email: string, password: string, displayName: string, userType: 'user' | 'service_provider' = 'user') => {
    try {
      const redirectUrl = `${window.location.origin}/`;
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            display_name: displayName,
            user_type: userType,
            role: userType,
          },
        },
      });
      
      if (error) throw error;
      
      toast({
        title: "Account created!",
        description: "Please check your email for verification.",
      });
    } catch (error: any) {
      console.error('Sign up error:', error);
      throw error;
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) throw error;
      
      toast({
        title: "Welcome back!",
        description: "You have been signed in successfully.",
      });
    } catch (error: any) {
      console.error('Sign in error:', error);
      throw error;
    }
  };

  const signInWithProvider = async (provider: Exclude<AuthProvider, 'email'>) => {
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: provider as any,
        options: {
          redirectTo: `${window.location.origin}/`
        }
      });
      
      if (error) throw error;
    } catch (error: any) {
      console.error(`${provider} sign in error:`, error);
      throw error;
    }
  };

  const signInWithMagicLink = async (email: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/`
        }
      });
      
      if (error) throw error;
      
      toast({
        title: "Magic link sent!",
        description: "Check your email for the sign-in link.",
      });
    } catch (error: any) {
      console.error('Magic link error:', error);
      throw error;
    }
  };

  const sendPasswordReset = async (email: string) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth`,
      });
      
      if (error) throw error;
      
      toast({
        title: "Reset link sent!",
        description: "Check your email for the password reset link.",
      });
    } catch (error: any) {
      console.error('Password reset error:', error);
      throw error;
    }
  };

  const updateProfile = async (updates: { display_name?: string; user_type?: 'user' | 'service_provider' }) => {
    if (!user) throw new Error('No user logged in');
    
    try {
      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.id);
      
      if (error) throw error;
      
      toast({
        title: "Profile updated!",
        description: "Your profile has been updated successfully.",
      });
    } catch (error: any) {
      console.error('Profile update error:', error);
      throw error;
    }
  };

  const signOut = async () => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signOut();
      
      if (error) throw error;
      
      setSession(null);
      setUser(null);
      
      toast({
        title: "Signed out",
        description: "You have been signed out successfully.",
      });
    } catch (error: any) {
      console.error('Sign out error:', error);
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
    signInWithProvider,
    signInWithMagicLink,
    signOut,
    sendPasswordReset,
    updateProfile,
  };

  return <EnhancedAuthContext.Provider value={value}>{children}</EnhancedAuthContext.Provider>;
};
