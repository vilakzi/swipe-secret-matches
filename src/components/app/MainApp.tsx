import React from 'react';
import { Routes, Route, Navigate } from "react-router-dom";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/toaster";
import { useAuth } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import ServiceProviderRoute from "@/components/ServiceProviderRoute";
import AdminRoute from "@/components/AdminRoute";
import AppLayout from "@/components/layout/AppLayout";
import ErrorBoundary from "@/components/common/ErrorBoundary";
import Auth from "@/pages/Auth";

const Index = React.lazy(() => import("@/pages/Index"));
const Profile = React.lazy(() => import("@/pages/Profile"));
const UserProfile = React.lazy(() => import("@/pages/UserProfile"));
const Settings = React.lazy(() => import("@/pages/Settings"));
const ServiceProviderDashboard = React.lazy(() => import("@/pages/ServiceProviderDashboard"));
const AdminDashboard = React.lazy(() => import("@/pages/AdminDashboard"));
const NotFound = React.lazy(() => import("@/pages/NotFound"));

const LoadingSpinner = () => (
  <div className="min-h-screen bg-background flex items-center justify-center">
    <div className="text-center p-8">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
      <h2 className="text-xl font-semibold">Loading...</h2>
    </div>
  </div>
);

const AppRoutes = () => {
  const { user, loading, session } = useAuth();

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-background">
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
        <Toaster />
      </div>
    </TooltipProvider>
  );
};

const MainApp = () => {
  
  return (
    <ErrorBoundary>
      <AppRoutes />
    </ErrorBoundary>
  );
};

export default MainApp;