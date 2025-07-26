import React from 'react';
import { Routes, Route, Navigate } from "react-router-dom";
import { QueryClientProvider, QueryClient } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ErrorProvider } from "@/components/common/ErrorTaskBar";
import { AuthProvider } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import ServiceProviderRoute from "@/components/ServiceProviderRoute";
import AdminRoute from "@/components/AdminRoute";
import AppLayout from "@/components/layout/AppLayout";
import ErrorBoundary from "@/components/common/ErrorBoundary";
import ErrorFallback from "@/components/common/ErrorFallback";
import { useSessionManager } from "@/hooks/useSessionManager";
import { useAuth } from "@/contexts/AuthContext";
import Auth from "@/pages/Auth";

// Create query client here to ensure it's available
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

// Lazy load heavy components to improve mobile performance
const Index = React.lazy(() => import("@/pages/Index"));
const Profile = React.lazy(() => import("@/pages/Profile"));
const UserProfile = React.lazy(() => import("@/pages/UserProfile"));
const Settings = React.lazy(() => import("@/pages/Settings"));
const ServiceProviderDashboard = React.lazy(() => import("@/pages/ServiceProviderDashboard"));
const AdminDashboard = React.lazy(() => import("@/pages/AdminDashboard"));
const NotFound = React.lazy(() => import("@/pages/NotFound"));

const LoadingSpinner = () => (
  <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-purple-900 flex items-center justify-center">
    <div className="text-center p-8">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500 mx-auto mb-4"></div>
      <h2 className="text-xl font-semibold text-white">Loading...</h2>
    </div>
  </div>
);

const MainApp = () => {
  console.log('MainApp: Starting with all providers inside');
  
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <ErrorProvider>
          <AuthProvider>
            <MainAppContent />
          </AuthProvider>
        </ErrorProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

const MainAppContent = () => {
  // Call hooks at the top level inside AuthProvider context
  useSessionManager();
  
  let user = null;
  let loading = true;
  
  // Safely use auth context with error handling
  try {
    const authContext = useAuth();
    user = authContext.user;
    loading = authContext.loading;
  } catch (error) {
    console.error('Auth context error:', error);
    // If auth context fails, show error fallback
    return (
      <ErrorFallback
        title="Authentication Error"
        message="There was an issue with the authentication system. Please refresh the page."
        showGoHome={false}
      />
    );
  }

  // Show loading spinner while auth is being determined
  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <ErrorBoundary>
      <Toaster />
      <Sonner />
      
      <React.Suspense fallback={<LoadingSpinner />}>
        <Routes>
          <Route 
            path="/auth" 
            element={user ? <Navigate to="/" replace /> : <Auth />} 
          />
          <Route path="/" element={
            <ProtectedRoute>
              <AppLayout>
                <ErrorBoundary>
                  <Index />
                </ErrorBoundary>
              </AppLayout>
            </ProtectedRoute>
          } />
          <Route path="/profile" element={
            <ProtectedRoute>
              <AppLayout>
                <ErrorBoundary>
                  <Profile />
                </ErrorBoundary>
              </AppLayout>
            </ProtectedRoute>
          } />
          <Route path="/profile/:userId" element={
            <ProtectedRoute>
              <AppLayout showBottomNav={false}>
                <ErrorBoundary>
                  <UserProfile />
                </ErrorBoundary>
              </AppLayout>
            </ProtectedRoute>
          } />
          <Route path="/settings" element={
            <ProtectedRoute>
              <AppLayout>
                <ErrorBoundary>
                  <Settings />
                </ErrorBoundary>
              </AppLayout>
            </ProtectedRoute>
          } />
          <Route path="/dashboard" element={
            <ServiceProviderRoute>
              <AppLayout showBottomNav={false}>
                <ErrorBoundary>
                  <ServiceProviderDashboard />
                </ErrorBoundary>
              </AppLayout>
            </ServiceProviderRoute>
          } />
          <Route path="/admin" element={
            <AdminRoute>
              <AppLayout showBottomNav={false}>
                <ErrorBoundary>
                  <AdminDashboard />
                </ErrorBoundary>
              </AppLayout>
            </AdminRoute>
          } />
          <Route path="*" element={
            <AppLayout showBottomNav={false}>
              <ErrorBoundary>
                <NotFound />
              </ErrorBoundary>
            </AppLayout>
          } />
        </Routes>
      </React.Suspense>
    </ErrorBoundary>
  );
};

export default MainApp;
