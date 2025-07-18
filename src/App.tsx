
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { EnhancedAuthProvider } from './contexts/EnhancedAuthContext';
import { Toaster } from 'react-hot-toast';
import ErrorBoundary from './components/common/ErrorBoundary';
import Auth from './pages/Auth';
import Index from './pages/Index';

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes
      retry: 2,
    },
  },
});

console.log('🚀 App loading...');

function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <EnhancedAuthProvider>
          <Router>
            <Routes>
              <Route path="/auth" element={<Auth />} />
              <Route path="/" element={<Index />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
            <Toaster position="top-right" />
          </Router>
        </EnhancedAuthProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
