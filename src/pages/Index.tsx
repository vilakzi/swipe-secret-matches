
import { useState, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Heart, User, Settings } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import OnlineStatus from '@/components/OnlineStatus';
import Feedpage from '@/components/feed/Feedpage';
import { usePresence } from '@/hooks/usePresence';
import { useUserRole } from '@/hooks/useUserRole';
import { useInactivityTracker } from '@/hooks/useInactivityTracker';
import { toast } from '@/hooks/use-toast';
import ErrorBoundary from '@/components/common/ErrorBoundary';

const Index = () => {
  const { user, signOut } = useAuth();
  const { isUserOnline } = usePresence();
  const { isServiceProvider, loading: roleLoading } = useUserRole();
  const navigate = useNavigate();

  // Auto-logout after 30 minutes of inactivity
  useInactivityTracker({
    timeoutMinutes: 30,
    onInactive: useCallback(() => {
      toast({
        title: "Session expired",
        description: "You've been logged out due to inactivity",
        variant: "destructive"
      });
      signOut();
    }, [signOut])
  });

  const handleDashboard = useCallback(() => {
    navigate('/dashboard');
  }, [navigate]);

  // Show loading state
  if (roleLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-purple-900">
        <div className="text-center p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-white">Loading...</h2>
        </div>
      </div>
    );
  }

  // Check if user is logged in
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-purple-900">
        <div className="text-center p-8">
          <h2 className="text-2xl font-bold text-white mb-4">Please log in</h2>
          <Button
            onClick={() => navigate('/auth')}
            className="bg-purple-600 hover:bg-purple-700"
          >
            Go to Login
          </Button>
        </div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-black">
        <header className="fixed top-0 left-0 right-0 z-40 bg-black/90 backdrop-blur-md border-b border-gray-700">
          <div className="p-4 flex justify-between items-center max-w-md mx-auto">
            <div className="flex items-center space-x-3">
              <Heart className="w-8 h-8 text-pink-500" />
              <div>
                <h1 className="text-2xl font-bold text-white">Social</h1>
                <p className="text-xs text-gray-400">Instagram-style feed</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <div className="flex items-center space-x-2 bg-black/20 backdrop-blur-md rounded-full px-3 py-2 border border-gray-700">
                <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center">
                  <User className="w-4 h-4 text-white" />
                </div>
                <OnlineStatus 
                  isOnline={isUserOnline(user.id)} 
                  size="sm"
                />
              </div>
              
              {isServiceProvider && (
                <Button
                  onClick={handleDashboard}
                  variant="ghost"
                  size="sm"
                  className="text-white hover:bg-white/10"
                >
                  <Settings className="w-4 h-4" />
                </Button>
              )}
            </div>
          </div>
        </header>

        <div className="pt-20">
          <Feedpage />
        </div>
      </div>
    </ErrorBoundary>
  );
};

export default Index;
