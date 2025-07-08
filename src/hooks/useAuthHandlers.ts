
import { useState, useCallback } from 'react';
import { useEnhancedAuth } from '@/contexts/EnhancedAuthContext';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { validateEmail } from '@/utils/emailValidation';
import { useErrorHandler } from './useErrorHandler';
import { useRetryableOperation } from './useRetryableOperation';

export const useAuthHandlers = () => {
  const [loading, setLoading] = useState(false);
  const { signIn, signUp } = useEnhancedAuth();
  const navigate = useNavigate();
  const { handleError, handleSuccess } = useErrorHandler();

  const { execute: executeWithRetry } = useRetryableOperation({
    maxRetries: 2,
    errorType: 'auth',
    onSuccess: () => {
      handleSuccess("Operation completed successfully!");
    }
  });

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
    
    // Enhanced validation with specific error messages
    const emailValidation = validateEmail(email);
    if (!emailValidation.isValid) {
      handleError(
        new Error(emailValidation.error || 'Invalid email'),
        'auth',
        undefined,
        emailValidation.error || 'Please enter a valid email address'
      );
      return;
    }

    if (!password || password.length < 6) {
      handleError(
        new Error('Invalid password'),
        'auth',
        undefined,
        'Password must be at least 6 characters long'
      );
      return;
    }

    if (!isLogin && !displayName.trim()) {
      handleError(
        new Error('Display name required'),
        'auth',
        undefined,
        'Please enter a display name'
      );
      return;
    }

    // Enhanced phone validation for service providers
    if (!isLogin && userType === 'service_provider' && (!phone || phone.trim().length < 8)) {
      handleError(
        new Error('Phone number required'),
        'auth',
        undefined,
        'Service providers must provide a valid phone number (at least 8 characters)'
      );
      return;
    }
    
    setLoading(true);

    try {
      await executeWithRetry(async () => {
        if (isLogin) {
          await signIn(email, password);
          handleSuccess("Welcome back!", "Signed In");
          navigate('/');
        } else {
          // Sign up with enhanced error handling
          await signUp(email, password, displayName, userType);

          // Update profile with additional info
          try {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
              const { error } = await supabase
                .from('profiles')
                .update({ 
                  user_type: userType,
                  role: isAdmin ? 'admin' : userType,
                  phone: userType === 'service_provider' ? (phone || '') : ''
                })
                .eq('id', user.id);

              if (error) {
                console.error('Error updating user profile:', error);
                // Don't fail the whole operation for profile update issues
                handleError(
                  error,
                  'generic',
                  'profile update',
                  'Account created but profile update failed. You can complete your profile later.'
                );
              }
            }
          } catch (profileError) {
            console.error('Profile update error:', profileError);
            // Non-critical error, don't block the flow
          }

          handleSuccess(
            `Welcome ${isAdmin ? 'Administrator' : userType === 'service_provider' ? 'Service Provider' : 'User'}! Let's set up your profile.`,
            "Account Created"
          );
          navigate('/onboarding');
        }
      });
    } catch (error: any) {
      // Error already handled by executeWithRetry and handleError
      console.error('Authentication failed:', error);
    } finally {
      setLoading(false);
    }
  }, [loading, signIn, signUp, navigate, handleError, handleSuccess, executeWithRetry]);

  const handleForgotPassword = useCallback(async (resetEmail: string) => {
    // Enhanced email validation
    const emailValidation = validateEmail(resetEmail);
    if (!emailValidation.isValid) {
      handleError(
        new Error(emailValidation.error || 'Invalid email'),
        'auth',
        undefined,
        emailValidation.error || 'Please enter a valid email address'
      );
      return;
    }

    try {
      await executeWithRetry(async () => {
        const { error } = await supabase.auth.resetPasswordForEmail(resetEmail, {
          redirectTo: `${window.location.origin}/auth`,
        });
        
        if (error) throw error;
        
        handleSuccess(
          "Check your email for a password reset link. Make sure to check your spam folder too.",
          "Reset Link Sent"
        );
      });
    } catch (error: any) {
      // Error already handled by executeWithRetry
      console.error('Password reset failed:', error);
    }
  }, [handleError, handleSuccess, executeWithRetry]);

  return {
    loading,
    handleSubmit,
    handleForgotPassword,
  };
};
