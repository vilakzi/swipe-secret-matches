
import { useState, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';
import { rateLimit } from '@/utils/securityValidation';
import { validateEmailSecurity } from '@/utils/enhancedEmailValidation';
import { sanitizeInput, validatePhoneNumber } from '@/utils/inputSanitization';

export const useSecureAuth = () => {
  const [loading, setLoading] = useState(false);
  const { signIn, signUp } = useAuth();

  const secureSignIn = useCallback(async (email: string, password: string) => {
    // Rate limiting
    if (!rateLimit(`login:${email}`, 3, 5 * 60 * 1000)) {
      toast({
        title: "Too many attempts",
        description: "Please wait 5 minutes before trying again.",
        variant: "destructive",
      });
      return;
    }

    // Validate email
    const emailValidation = validateEmailSecurity(email);
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
      await signIn(email, password);
    } catch (error: any) {
      // Generic error message to prevent information leakage
      toast({
        title: "Login failed",
        description: "Invalid credentials. Please check your email and password.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [signIn]);

  const secureSignUp = useCallback(async (
    email: string,
    password: string,
    displayName: string,
    userType: 'user' | 'service_provider',
    phone?: string
  ) => {
    // Rate limiting
    if (!rateLimit(`signup:${email}`, 2, 10 * 60 * 1000)) {
      toast({
        title: "Too many attempts",
        description: "Please wait 10 minutes before trying again.",
        variant: "destructive",
      });
      return;
    }

    // Validate inputs
    const emailValidation = validateEmailSecurity(email);
    if (!emailValidation.isValid) {
      toast({
        title: "Invalid email",
        description: emailValidation.error,
        variant: "destructive",
      });
      return;
    }

    const sanitizedName = sanitizeInput(displayName);
    if (!sanitizedName || sanitizedName.length < 2) {
      toast({
        title: "Invalid name",
        description: "Display name must be at least 2 characters.",
        variant: "destructive",
      });
      return;
    }

    if (phone) {
      const phoneValidation = validatePhoneNumber(phone);
      if (!phoneValidation.isValid) {
        toast({
          title: "Invalid phone",
          description: phoneValidation.error,
          variant: "destructive",
        });
        return;
      }
    }

    // Password strength check
    if (password.length < 8) {
      toast({
        title: "Weak password",
        description: "Password must be at least 8 characters long.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      await signUp(email, password, sanitizedName, userType);
    } catch (error: any) {
      toast({
        title: "Registration failed",
        description: "Unable to create account. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [signUp]);

  return {
    loading,
    secureSignIn,
    secureSignUp
  };
};
