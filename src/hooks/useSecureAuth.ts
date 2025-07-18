
import { useState, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useErrorHandler } from '@/hooks/useErrorHandler';
import { rateLimit } from '@/utils/securityValidation';
import { validateEmailSecurity } from '@/utils/enhancedEmailValidation';
import { sanitizeInput, validatePhoneNumber } from '@/utils/inputSanitization';

export const useSecureAuth = () => {
  const [loading, setLoading] = useState(false);
  const { signIn, signUp } = useAuth();
  const { handleError, handleSuccess } = useErrorHandler();

  const secureSignIn = useCallback(async (email: string, password: string) => {
    // Rate limiting
    if (!rateLimit(`login:${email}`, 3, 5 * 60 * 1000)) {
      handleError(
        new Error('Rate limit exceeded'),
        'auth',
        undefined,
        'Too many login attempts. Please wait 5 minutes before trying again.'
      );
      return;
    }

    // Validate email
    const emailValidation = validateEmailSecurity(email);
    if (!emailValidation.isValid) {
      handleError(
        new Error('Invalid email'),
        'auth',
        undefined,
        emailValidation.error
      );
      return;
    }

    setLoading(true);
    try {
      await signIn(email, password);
      handleSuccess("Welcome back!", "Signed In");
    } catch (error: any) {
      handleError(error, 'auth');
    } finally {
      setLoading(false);
    }
  }, [signIn, handleError, handleSuccess]);

  const secureSignUp = useCallback(async (
    email: string,
    password: string,
    displayName: string,
    userType: 'user' | 'service_provider',
    phone?: string
  ) => {
    // Rate limiting
    if (!rateLimit(`signup:${email}`, 2, 10 * 60 * 1000)) {
      handleError(
        new Error('Rate limit exceeded'),
        'auth',
        undefined,
        'Too many signup attempts. Please wait 10 minutes before trying again.'
      );
      return;
    }

    // Validate inputs
    const emailValidation = validateEmailSecurity(email);
    if (!emailValidation.isValid) {
      handleError(
        new Error('Invalid email'),
        'auth',
        undefined,
        emailValidation.error
      );
      return;
    }

    const sanitizedName = sanitizeInput(displayName);
    if (!sanitizedName || sanitizedName.length < 2) {
      handleError(
        new Error('Invalid name'),
        'auth',
        undefined,
        'Display name must be at least 2 characters long.'
      );
      return;
    }

    if (phone) {
      const phoneValidation = validatePhoneNumber(phone);
      if (!phoneValidation.isValid) {
        handleError(
          new Error('Invalid phone'),
          'auth',
          undefined,
          phoneValidation.error
        );
        return;
      }
    }

    // Password strength check
    if (password.length < 8) {
      handleError(
        new Error('Weak password'),
        'auth',
        undefined,
        'Password must be at least 8 characters long.'
      );
      return;
    }

    setLoading(true);
    try {
      await signUp(email, password, sanitizedName, userType);
      handleSuccess("Account created! Please check your email for verification.", "Account Created");
    } catch (error: any) {
      handleError(error, 'auth');
    } finally {
      setLoading(false);
    }
  }, [signUp, handleError, handleSuccess]);

  return {
    loading,
    secureSignIn,
    secureSignUp
  };
};
