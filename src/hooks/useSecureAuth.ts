
import { useState, useCallback } from 'react';
import { useEnhancedAuth } from '@/contexts/EnhancedAuthContext';
import { useErrorHandler } from '@/hooks/useErrorHandler';

export const useSecureAuth = () => {
  const [loading, setLoading] = useState(false);
  const { signInWithGoogle, signOut } = useEnhancedAuth();
  const { handleError, handleSuccess } = useErrorHandler();

  const secureGoogleSignIn = useCallback(async () => {
    setLoading(true);
    try {
      await signInWithGoogle();
      handleSuccess("Welcome! You've signed in successfully.", "Signed In");
    } catch (error: any) {
      handleError(error, 'auth', undefined, 'Failed to sign in with Google. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [signInWithGoogle, handleError, handleSuccess]);

  const secureSignOut = useCallback(async () => {
    setLoading(true);
    try {
      await signOut();
      handleSuccess("You've been signed out successfully.", "Signed Out");
    } catch (error: any) {
      handleError(error, 'auth', undefined, 'Failed to sign out. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [signOut, handleError, handleSuccess]);

  return {
    loading,
    secureGoogleSignIn,
    secureSignOut
  };
};
