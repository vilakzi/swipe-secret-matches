
import React, { createContext, useContext, ReactNode } from 'react';
import { getCurrentSecurityContext, SecurityContext } from '@/utils/authorizationUtils';
import { toast } from '@/hooks/use-toast';

interface SecureApiContextType {
  executeSecureOperation: <T>(
    operation: () => Promise<T>,
    requiredRole?: 'admin' | 'service_provider'
  ) => Promise<T | null>;
}

const SecureApiContext = createContext<SecureApiContextType | undefined>(undefined);

export const useSecureApi = () => {
  const context = useContext(SecureApiContext);
  if (!context) {
    throw new Error('useSecureApi must be used within SecureApiProvider');
  }
  return context;
};

interface SecureApiProviderProps {
  children: ReactNode;
}

export const SecureApiProvider: React.FC<SecureApiProviderProps> = ({ children }) => {
  const executeSecureOperation = async <T,>(
    operation: () => Promise<T>,
    requiredRole?: 'admin' | 'service_provider'
  ): Promise<T | null> => {
    try {
      const context = await getCurrentSecurityContext();
      
      if (!context) {
        toast({
          title: "Authentication required",
          description: "Please sign in to continue.",
          variant: "destructive",
        });
        return null;
      }

      // Check role requirements
      if (requiredRole === 'admin' && context.role !== 'admin') {
        toast({
          title: "Access denied",
          description: "Admin privileges required for this operation.",
          variant: "destructive",
        });
        return null;
      }

      if (requiredRole === 'service_provider' && 
          context.role !== 'service_provider' && 
          context.role !== 'admin') {
        toast({
          title: "Access denied",
          description: "Service provider privileges required for this operation.",
          variant: "destructive",
        });
        return null;
      }

      // Execute the operation
      return await operation();
    } catch (error: any) {
      console.error('Secure operation failed:', error);
      
      // Handle specific error types
      if (error.message?.includes('row-level security')) {
        toast({
          title: "Access denied",
          description: "You don't have permission to access this resource.",
          variant: "destructive",
        });
      } else if (error.message?.includes('JWT')) {
        toast({
          title: "Session expired",
          description: "Please sign in again.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Operation failed",
          description: "An error occurred while processing your request.",
          variant: "destructive",
        });
      }
      
      return null;
    }
  };

  return (
    <SecureApiContext.Provider value={{ executeSecureOperation }}>
      {children}
    </SecureApiContext.Provider>
  );
};
