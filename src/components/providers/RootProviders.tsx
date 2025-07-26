
import React from 'react';
import { BrowserRouter } from "react-router-dom";

interface RootProvidersProps {
  children: React.ReactNode;
}

const RootProviders = ({ children }: RootProvidersProps) => {
  console.log('RootProviders: Ultra minimal setup');
  
  return (
    <BrowserRouter>
      {children}
    </BrowserRouter>
  );
};

export default RootProviders;
