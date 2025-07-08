
import { useCallback } from 'react';
import { useEnhancedAuth } from '@/contexts/EnhancedAuthContext';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useErrorHandler } from './useErrorHandler';
import { useRetryableOperation } from './useRetryableOperation';

interface AuthFormData {
  email: string;
  password: string;
  displayName: string;
  userType: 'user' | 'service_provider';
  isAdmin: boolean;
  phone?: string;
}

export const useAuthOperations = () => {
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

  const performSignIn = useCallback(async (email: string, password: string) => {
    await executeWithRetry(async () => {
      await signIn(email, password);
      handleSuccess("Welcome back!", "Signed In");
      navigate('/');
    });
  }, [signIn, navigate, handleSuccess, executeWithRetry]);

  const performSignUp = useCallback(async (formData: AuthFormData) => {
    await executeWithRetry(async () => {
      await signUp(formData.email, formData.password, formData.displayName, formData.userType);

      // Update profile with additional info
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { error } = await supabase
            .from('profiles')
            .update({ 
              user_type: formData.userType,
              role: formData.isAdmin ? 'admin' : formData.userType,
              phone: formData.userType === 'service_provider' ? (formData.phone || '') : ''
            })
            .eq('id', user.id);

          if (error) {
            console.error('Error updating user profile:', error);
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
      }

      handleSuccess(
        `Welcome ${formData.isAdmin ? 'Administrator' : formData.userType === 'service_provider' ? 'Service Provider' : 'User'}! Let's set up your profile.`,
        "Account Created"
      );
      navigate('/onboarding');
    });
  }, [signUp, navigate, handleError, handleSuccess, executeWithRetry]);

  const performPasswordReset = useCallback(async (resetEmail: string) => {
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
  }, [handleSuccess, executeWithRetry]);

  return {
    performSignIn,
    performSignUp,
    performPasswordReset,
  };
};
