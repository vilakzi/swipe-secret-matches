
import { useState, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Heart, User, Settings } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import OnlineStatus from '@/components/OnlineStatus';
import InstagramFeed from '@/components/feed/InstagramFeed';
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

  const handleProfile = useCallback(() => {
    navigate('/profile');
  }, [navigate]);

  // Show loading state
  if (roleLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-foreground">Loading...</h2>
        </div>
      </div>
    );
  }

  // Check if user is logged in
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center p-8">
          <h2 className="text-2xl font-bold text-foreground mb-4">Please log in</h2>
          <Button
            onClick={() => navigate('/auth')}
            className="bg-primary hover:bg-primary/90"
          >
            Go to Login
          </Button>
        </div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-background">
        {/* Main Content */}
        <div className="max-w-lg mx-auto">
          <InstagramFeed />
        </div>

        {/* Bottom Navigation */}
        <nav className="fixed bottom-0 left-0 right-0 bg-background/80 backdrop-blur-md border-t border-border">
          <div className="flex justify-around items-center py-2 px-4 max-w-lg mx-auto">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/')}
              className="flex flex-col items-center space-y-1 text-foreground"
            >
              <Heart className="w-5 h-5" />
              <span className="text-xs">Home</span>
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={handleProfile}
              className="flex flex-col items-center space-y-1 text-foreground"
            >
              <User className="w-5 h-5" />
              <span className="text-xs">Profile</span>
            </Button>

            {isServiceProvider && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDashboard}
                className="flex flex-col items-center space-y-1 text-foreground"
              >
                <Settings className="w-5 h-5" />
                <span className="text-xs">Dashboard</span>
              </Button>
            )}
          </div>
        </nav>
      </div>
    </ErrorBoundary>
  );
};

export default Index;
