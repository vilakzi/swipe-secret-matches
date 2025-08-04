
import * as React from 'react';
import { BrowserRouter } from "react-router-dom";

interface RootProvidersProps {
  children: React.ReactNode;
}

const RootProviders = ({ children }: RootProvidersProps) => {
  // Minimal root providers setup
  
  return (
    <BrowserRouter>
      {children}
    </BrowserRouter>
  );
};

export default RootProviders;
