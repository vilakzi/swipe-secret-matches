
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { EnhancedAuthProvider, useEnhancedAuth } from "@/contexts/EnhancedAuthContext";
import { SecureApiProvider } from "@/components/security/SecureApiWrapper";
import ErrorProvider from "@/components/common/ErrorTaskBar";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Profile from "./pages/Profile";
import Matches from "./pages/Matches";
import Settings from "./pages/Settings";
import Onboarding from "./pages/Onboarding";
import AdminDashboard from "./pages/AdminDashboard";
import ServiceProviderDashboard from "./pages/ServiceProviderDashboard";
import ProviderProfile from "./pages/ProviderProfile";
import UserProfile from "./pages/UserProfile";
import NotFound from "./pages/NotFound";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminRoute from "./components/AdminRoute";
import ServiceProviderRoute from "./components/ServiceProviderRoute";
import ModernAuthForm from "./components/auth/ModernAuthForm";

const queryClient = new QueryClient();

const AppRoutes = () => {
  const { user, loading } = useEnhancedAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-purple-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/auth" element={user ? <Navigate to="/" /> : <ModernAuthForm />} />
      
      {/* Protected Routes */}
      <Route path="/" element={
        <ProtectedRoute>
          <Index />
        </ProtectedRoute>
      } />
      
      <Route path="/profile" element={
        <ProtectedRoute>
          <Profile />
        </ProtectedRoute>
      } />
      
      <Route path="/matches" element={
        <ProtectedRoute>
          <Matches />
        </ProtectedRoute>
      } />
      
      <Route path="/settings" element={
        <ProtectedRoute>
          <Settings />
        </ProtectedRoute>
      } />
      
      <Route path="/onboarding" element={
        <ProtectedRoute>
          <Onboarding />
        </ProtectedRoute>
      } />
      
      <Route path="/user/:id" element={
        <ProtectedRoute>
          <UserProfile />
        </ProtectedRoute>
      } />
      
      {/* Admin Routes */}
      <Route path="/admin" element={
        <AdminRoute>
          <AdminDashboard />
        </AdminRoute>
      } />
      
      {/* Service Provider Routes */}
      <Route path="/dashboard" element={
        <ServiceProviderRoute>
          <ServiceProviderDashboard />
        </ServiceProviderRoute>
      } />
      
      <Route path="/provider/:id" element={
        <ProtectedRoute>
          <ProviderProfile />
        </ProtectedRoute>
      } />
      
      {/* 404 Route */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <ErrorProvider>
          <EnhancedAuthProvider>
            <SecureApiProvider>
              <BrowserRouter>
                <div className="min-h-screen bg-background font-sans antialiased">
                  <AppRoutes />
                </div>
                <Toaster />
                <Sonner />
              </BrowserRouter>
            </SecureApiProvider>
          </EnhancedAuthProvider>
        </ErrorProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
