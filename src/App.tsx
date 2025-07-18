
import React from 'react';
import { Toaster } from "@/components/ui/toaster";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import ErrorBoundary from "@/components/common/ErrorBoundary";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import { EnhancedAuthProvider, useEnhancedAuth } from "@/contexts/EnhancedAuthContext";

console.log('🚀 App.tsx loaded at:', new Date().toISOString());

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

const AppContent = () => {
  const { user, loading, authError } = useEnhancedAuth();

  console.log('🔍 AppContent render - user:', !!user, 'loading:', loading, 'authError:', authError);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-purple-900 flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size="lg" text="Loading..." />
          {authError && (
            <div className="mt-4 p-4 bg-yellow-900/50 border border-yellow-600 rounded-lg max-w-md">
              <p className="text-yellow-200 text-sm">{authError}</p>
              <button 
                onClick={() => window.location.reload()} 
                className="mt-2 px-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700 text-sm"
              >
                Retry
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-purple-900 font-sans antialiased">
      <Routes>
        <Route path="/auth" element={user ? <Navigate to="/" /> : <Auth />} />
        <Route path="/" element={user ? <Index /> : <Navigate to="/auth" />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </div>
  );
};

const App = () => {
  console.log('🔄 App component rendering at:', new Date().toISOString());
  
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <QueryClientProvider client={queryClient}>
          <EnhancedAuthProvider>
            <AppContent />
            <Toaster />
          </EnhancedAuthProvider>
        </QueryClientProvider>
      </BrowserRouter>
    </ErrorBoundary>
  );
};

export default App;
