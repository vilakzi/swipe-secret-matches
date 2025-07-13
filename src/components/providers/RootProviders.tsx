import React, { useEffect } from 'react';
import { QueryClientProvider } from "@tanstack/react-query";
import { TooltipProvider } from "@/components/ui/tooltip";
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { SecureApiProvider } from "@/components/security/SecureApiWrapper";
import { ErrorProvider } from "@/components/common/ErrorTaskBar";
import { queryClient } from "@/config/queryClient";
import ErrorBoundary from "@/components/common/ErrorBoundary";
import { toast } from "@/components/ui/use-toast";

// Network status monitor component
const NetworkMonitor: React.FC = () => {
  useEffect(() => {
    const handleOnline = () => {
      toast({
        title: 'Connected',
        description: 'Your internet connection has been restored',
      });
      // Revalidate queries when connection is restored
      queryClient.refetchQueries();
    };

    const handleOffline = () => {
      toast({
        title: 'Disconnected',
        description: 'Please check your internet connection',
        variant: 'destructive',
      });
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return null;
};

interface RootProvidersProps {
  children: React.ReactNode;
}

const RootProviders = ({ children }: RootProvidersProps) => {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <ErrorProvider>
            <BrowserRouter>
              <AuthProvider>
                <SecureApiProvider>
                  <NetworkMonitor />
                  <ErrorBoundary>
                    {children}
                  </ErrorBoundary>
                </SecureApiProvider>
              </AuthProvider>
            </BrowserRouter>
          </ErrorProvider>
        </TooltipProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
};
export default RootProviders;
