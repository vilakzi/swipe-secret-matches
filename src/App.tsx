
import React from 'react';
import { BrowserRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from "@/components/ui/sonner";
import MainApp from "@/components/app/MainApp";

// Create QueryClient with stable configuration
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

const App: React.FC = () => {
  console.log('App.tsx: Starting with simplified provider structure');
  
  return (
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        <MainApp />
        <Toaster />
      </QueryClientProvider>
    </BrowserRouter>
  );
};

export default App;
