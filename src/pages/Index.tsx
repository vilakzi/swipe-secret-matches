
import * as React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import InstagramFeed from '@/components/feed/InstagramFeed';
import BottomNavigation from '@/components/navigation/BottomNavigation';
import { useUserRole } from '@/hooks/useUserRole';
import { useInactivityTracker } from '@/hooks/useInactivityTracker';
import { toast } from '@/hooks/use-toast';
import ErrorBoundary from '@/components/common/ErrorBoundary';

const Index = () => {
  const { user, signOut } = useAuth();
  const { isServiceProvider, loading: roleLoading } = useUserRole();
  const navigate = useNavigate();

  // Auto-logout after 30 minutes of inactivity
  useInactivityTracker({
    timeoutMinutes: 30,
    onInactive: React.useCallback(() => {
      toast({
        title: "Session expired",
        description: "You've been logged out due to inactivity",
        variant: "destructive"
      });
      signOut();
    }, [signOut])
  });

  const handleDashboard = React.useCallback(() => {
    navigate('/dashboard');
  }, [navigate]);

  const handleProfile = React.useCallback(() => {
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
      <div className="min-h-screen bg-background pb-20">
        {/* Main Content */}
        <div className="max-w-lg mx-auto">
          <InstagramFeed />
        </div>
        
        {/* Unified Bottom Navigation */}
        <BottomNavigation />
      </div>
    </ErrorBoundary>
  );
};

export default Index;
