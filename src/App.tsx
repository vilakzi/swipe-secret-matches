
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { sessionManager } from "@/utils/secureSessionManager";
import { useEffect } from "react";
import ProtectedRoute from "@/components/ProtectedRoute";
import ServiceProviderRoute from "@/components/ServiceProviderRoute";
import AdminRoute from "@/components/AdminRoute";
import AppLayout from "@/components/layout/AppLayout";
import AgeVerificationBanner from "@/components/AgeVerificationBanner";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Profile from "./pages/Profile";
import UserProfile from "./pages/UserProfile";
import Matches from "./pages/Matches";
import Messages from "./pages/Messages";
import Settings from "./pages/Settings";
import Onboarding from "./pages/Onboarding";
import ServiceProviderDashboard from "./pages/ServiceProviderDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import ProviderProfile from "./pages/ProviderProfile";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes
      retry: 2,
    },
  },
});

const App = () => {
  useEffect(() => {
    // Initialize secure session management
    sessionManager.startPeriodicValidation();

    // Cleanup on app unmount
    return () => {
      sessionManager.stopPeriodicValidation();
    };
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AuthProvider>
            <AgeVerificationBanner />
            <Routes>
              <Route path="/auth" element={<Auth />} />
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
              <Route path="/messages" element={
                <ProtectedRoute>
                  <AppLayout>
                    <Messages />
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
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
