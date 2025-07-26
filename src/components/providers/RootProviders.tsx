
import React from 'react';
import { QueryClientProvider, QueryClient } from "@tanstack/react-query";
import { TooltipProvider } from "@/components/ui/tooltip";
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { SecureApiProvider } from "@/components/security/SecureApiWrapper";
import { ErrorProvider } from "@/components/common/ErrorTaskBar";

// Create query client directly in this file to avoid any import issues
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes
      retry: 1,
      refetchOnWindowFocus: false,
      refetchOnMount: false,
    },
  },
});

interface RootProvidersProps {
  children: React.ReactNode;
}

const RootProviders = ({ children }: RootProvidersProps) => {
  console.log('RootProviders: Starting provider setup');
  console.log('RootProviders: QueryClient created:', queryClient);
  
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <ErrorProvider>
          <BrowserRouter>
            <AuthProvider>
              <SecureApiProvider>
                {children}
              </SecureApiProvider>
            </AuthProvider>
          </BrowserRouter>
        </ErrorProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default RootProviders;
