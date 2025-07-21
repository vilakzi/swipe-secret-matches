
import React from 'react';
import { QueryClientProvider } from "@tanstack/react-query";
import { TooltipProvider } from "@/components/ui/tooltip";
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { SecureApiProvider } from "@/components/security/SecureApiWrapper";
import { ErrorProvider } from "@/components/common/ErrorTaskBar";
import { createQueryClient } from "@/config/queryClient";

interface RootProvidersProps {
  children: React.ReactNode;
}

const RootProviders = ({ children }: RootProvidersProps) => {
  // Create query client instance within the component to ensure proper React context
  const [queryClient] = React.useState(() => createQueryClient());

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
