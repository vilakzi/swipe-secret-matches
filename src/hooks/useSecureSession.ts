
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { sessionManager } from '@/utils/secureSessionManager';
import { getCurrentSecurityContext, SecurityContext } from '@/utils/authorizationUtils';

export const useSecureSession = () => {
  const { user, session } = useAuth();
  const [securityContext, setSecurityContext] = useState<SecurityContext | null>(null);
  const [isValidating, setIsValidating] = useState(false);

  useEffect(() => {
    const validateAndUpdateContext = async () => {
      if (!user || !session) {
        setSecurityContext(null);
        return;
      }

      setIsValidating(true);
      
      try {
        // Validate session
        const isValid = await sessionManager.validateSession();
        
        if (!isValid) {
          console.log('Session validation failed');
          setSecurityContext(null);
          return;
        }

        // Get security context
        const context = await getCurrentSecurityContext();
        setSecurityContext(context);
      } catch (error) {
        console.error('Session validation error:', error);
        setSecurityContext(null);
      } finally {
        setIsValidating(false);
      }
    };

    validateAndUpdateContext();
  }, [user, session]);

  const refreshSecurityContext = async () => {
    const context = await getCurrentSecurityContext();
    setSecurityContext(context);
    return context;
  };

  return {
    securityContext,
    isValidating,
    refreshSecurityContext,
    isAuthenticated: !!securityContext,
    isAdmin: securityContext?.role === 'admin',
    isServiceProvider: securityContext?.role === 'service_provider' || securityContext?.role === 'admin'
  };
};
