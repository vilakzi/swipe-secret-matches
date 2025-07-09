import React from 'react';
import { QueryClientProvider } from "@tanstack/react-query";
import { TooltipProvider } from "@/components/ui/tooltip";
import { BrowserRouter } from "react-router-dom";
import { EnhancedAuthProvider } from "@/contexts/EnhancedAuthContext";
import { SecureApiProvider } from "@/components/security/SecureApiWrapper";
import { ErrorProvider } from "@/components/common/ErrorTaskBar";
import { queryClient } from "@/config/queryClient";

interface RootProvidersProps {
  children: React.ReactNode;
}

const RootProviders = ({ children }: RootProvidersProps) => {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <ErrorProvider>
          <BrowserRouter>
            <EnhancedAuthProvider>
              <SecureApiProvider>
                {children}
              </SecureApiProvider>
            </EnhancedAuthProvider>
          </BrowserRouter>
        </ErrorProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
};
export default RootProviders;
