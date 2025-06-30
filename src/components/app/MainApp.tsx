import React from 'react';
import { Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import ProtectedRoute from "@/components/ProtectedRoute";
import ServiceProviderRoute from "@/components/ServiceProviderRoute";
import AdminRoute from "@/components/AdminRoute";
import AppLayout from "@/components/layout/AppLayout";
import AgeVerificationBanner from "@/components/AgeVerificationBanner";
import { useSessionManager } from "@/hooks/useSessionManager";
import { useAuth } from "@/contexts/AuthContext";
import Auth from "@/pages/Auth";

// Lazy load heavy components to improve mobile performance
const Index = React.lazy(() => import("@/pages/Index"));
const Profile = React.lazy(() => import("@/pages/Profile"));
const UserProfile = React.lazy(() => import("@/pages/UserProfile"));
const Matches = React.lazy(() => import("@/pages/Matches"));
const Settings = React.lazy(() => import("@/pages/Settings"));
const Onboarding = React.lazy(() => import("@/pages/Onboarding"));
const ServiceProviderDashboard = React.lazy(() => import("@/pages/ServiceProviderDashboard"));
const AdminDashboard = React.lazy(() => import("@/pages/AdminDashboard"));
const ProviderProfile = React.lazy(() => import("@/pages/ProviderProfile"));
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
  useSessionManager();
  const { user, loading } = useAuth();

  // Show loading spinner while auth is being determined
  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <>
      <Toaster />
      <Sonner />
      <AgeVerificationBanner />
      <React.Suspense fallback={<LoadingSpinner />}>
        <Routes>
          <Route 
            path="/auth" 
            element={user ? <Navigate to="/" replace /> : <Auth />} 
          />
          <Route path="/onboarding" element={
            <ProtectedRoute>
              <AppLayout showBottomNav={false}>
                <Onboarding />
              </AppLayout>
            </ProtectedRoute>
          } />
          <Route path="/" element={
            <ProtectedRoute>
              <AppLayout>
                <Index />
              </AppLayout>
            </ProtectedRoute>
          } />
          <Route path="/profile" element={
            <ProtectedRoute>
              <AppLayout>
                <Profile />
              </AppLayout>
            </ProtectedRoute>
          } />
          <Route path="/profile/:userId" element={
            <ProtectedRoute>
              <AppLayout showBottomNav={false}>
                <UserProfile />
              </AppLayout>
            </ProtectedRoute>
          } />
          <Route path="/provider/:providerId" element={
            <ProtectedRoute>
              <AppLayout showBottomNav={false}>
                <ProviderProfile />
              </AppLayout>
            </ProtectedRoute>
          } />
          <Route path="/matches" element={
            <ProtectedRoute>
              <AppLayout>
                <Matches />
              </AppLayout>
            </ProtectedRoute>
          } />
          <Route path="/settings" element={
            <ProtectedRoute>
              <AppLayout>
                <Settings />
              </AppLayout>
            </ProtectedRoute>
          } />
          <Route path="/dashboard" element={
            <ServiceProviderRoute>
              <AppLayout showBottomNav={false}>
                <ServiceProviderDashboard />
              </AppLayout>
            </ServiceProviderRoute>
          } />
          <Route path="/admin" element={
            <AdminRoute>
              <AppLayout showBottomNav={false}>
                <AdminDashboard />
              </AppLayout>
            </AdminRoute>
          } />
          <Route path="*" element={
            <AppLayout showBottomNav={false}>
              <NotFound />
            </AppLayout>
          } />
        </Routes>
      </React.Suspense>
    </>
  );
};

export default MainApp;
