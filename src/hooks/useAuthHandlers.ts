
import { useState, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { validateEmail } from '@/utils/emailValidation';

export const useAuthHandlers = () => {
  const [loading, setLoading] = useState(false);
  const { signIn, signUp } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = useCallback(async (
    e: React.FormEvent,
    isLogin: boolean,
    email: string,
    password: string,
    displayName: string,
    userType: 'user' | 'service_provider',
    isAdmin: boolean,
    phone?: string
  ) => {
    e.preventDefault();
    if (loading) return;
    
    // Validate email before proceeding
    const emailValidation = validateEmail(email);
    if (!emailValidation.isValid) {
      toast({
        title: "Invalid email",
        description: emailValidation.error,
        variant: "destructive",
      });
      return;
    }
    
    setLoading(true);

    try {
      if (isLogin) {
        await signIn(email, password);
        toast({
          title: "Welcome back!",
          description: "You've been signed in successfully.",
        });
        navigate('/');
      } else {
        if (!displayName.trim()) {
          toast({
            title: "Display name required",
            description: "Please enter a display name.",
            variant: "destructive",
          });
          setLoading(false);
          return;
        }
        
        await signUp(email, password, displayName, userType, isAdmin, phone);

        try {
          const { data: { user } } = await supabase.auth.getUser();
          if (user) {
            const { error } = await supabase
              .from('profiles')
              .update({ 
                user_type: userType,
                role: isAdmin ? 'admin' : userType 
              })
              .eq('id', user.id);

            if (error) {
              console.error('Error updating user type:', error);
            }
          }
        } catch (profileError) {
          console.error('Profile update error:', profileError);
        }

        toast({
          title: "Account created!",
          description: `Welcome ${isAdmin ? 'Administrator' : userType === 'service_provider' ? 'Service Provider' : 'User'}! Let's set up your profile.`,
        });

        // Redirect to onboarding for new users
        navigate('/onboarding');
        return;
      }
      navigate('/');
    } catch (error: any) {
      // Handle specific email-related errors
      let errorMessage = error.message || "An error occurred. Please try again.";
      
      if (error.message?.includes('Invalid login credentials')) {
        errorMessage = "Invalid email or password. Please check your credentials and try again.";
      } else if (error.message?.includes('User already registered')) {
        errorMessage = "An account with this email already exists. Please sign in instead.";
      } else if (error.message?.includes('email')) {
        errorMessage = "Please check your email address and try again.";
      }
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [loading, signIn, signUp, navigate]);

  const handleForgotPassword = useCallback(async (resetEmail: string) => {
    // Validate email before sending reset
    const emailValidation = validateEmail(resetEmail);
    if (!emailValidation.isValid) {
      toast({
        title: "Invalid email",
        description: emailValidation.error,
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(resetEmail, {
        redirectTo: `${window.location.origin}/auth`,
      });
      
      if (error) throw error;
      
      toast({
        title: "Reset link sent!",
        description: "Check your email for a password reset link.",
      });
    } catch (error: any) {
      let errorMessage = error.message || "Failed to send reset link. Please try again.";
      
      if (error.message?.includes('email')) {
        errorMessage = "Please check your email address and try again.";
      }
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    }
  }, []);

  return {
    loading,
    handleSubmit,
    handleForgotPassword,
  };
};
