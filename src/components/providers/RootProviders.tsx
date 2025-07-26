
import React from 'react';
import { QueryClientProvider, QueryClient } from "@tanstack/react-query";
import { TooltipProvider } from "@/components/ui/tooltip";
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ErrorProvider } from "@/components/common/ErrorTaskBar";

// Create a stable query client instance
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

interface RootProvidersProps {
  children: React.ReactNode;
}

const RootProviders = ({ children }: RootProvidersProps) => {
  console.log('RootProviders: Starting with essential providers');
  
  return (
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        <ErrorProvider>
          <TooltipProvider>
            <AuthProvider>
              {children}
            </AuthProvider>
          </TooltipProvider>
        </ErrorProvider>
      </QueryClientProvider>
    </BrowserRouter>
  );
};

export default RootProviders;
