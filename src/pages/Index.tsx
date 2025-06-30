
import { useState, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Heart, User, Settings, Briefcase, Shield } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import OnlineStatus from '@/components/OnlineStatus';
import InstagramFeed from '@/components/InstagramFeed';
import ProfileCompletionPrompt from '@/components/onboarding/ProfileCompletionPrompt';
import { usePresence } from '@/hooks/usePresence';
import { useUserRole } from '@/hooks/useUserRole';
import { useInactivityTracker } from '@/hooks/useInactivityTracker';
import { toast } from '@/hooks/use-toast';
import { useError } from "@/components/common/ErrorTaskBar";

import ErrorBoundary from '@/components/common/ErrorBoundary';
import { usePerformanceMonitor } from '@/hooks/usePerformanceMonitor';

const Index = () => {
  const { user, signOut } = useAuth();
  const { isUserOnline } = usePresence();
  const { role, isAdmin, isServiceProvider, loading: roleLoading } = useUserRole();
  const navigate = useNavigate();
  const [likedItems, setLikedItems] = useState<Set<string>>(new Set());
  const [refreshKey, setRefreshKey] = useState(0);

  const { addError } = useError();
  const { logError } = usePerformanceMonitor('IndexPage');

  // ALL HOOKS MUST BE CALLED BEFORE ANY CONDITIONAL LOGIC
  // Auto-logout after 2 minutes of inactivity
  useInactivityTracker({
    timeoutMinutes: 2,
    onInactive: useCallback(() => {
      toast({
        title: "Session expired",
        description: "You've been logged out due to inactivity",
        variant: "destructive"
      });
      signOut();
    }, [signOut])
  });

  // Error handler for the error boundary
  const handleError = useCallback((error: Error) => {
    logError(error);
    addError(`Application error: ${error.message}`);
  }, [logError, addError]);

  const handleDashboard = useCallback(() => {
    navigate('/dashboard');
  }, [navigate]);

  const handleLike = useCallback((itemId: string, profileId: string) => {
    if (!user) {
      addError("You must be logged in to like profiles.");
      return;
    }
    
    setLikedItems(prev => {
      const newLiked = new Set(prev);
      if (newLiked.has(itemId)) {
        newLiked.delete(itemId);
      } else {
        newLiked.add(itemId);
      }
      return newLiked;
    });

    toast({
      title: likedItems.has(itemId) ? "Like removed" : "Profile liked!",
      description: likedItems.has(itemId) ? "You unliked this profile." : "Your like has been sent!",
    });
  }, [user, addError, likedItems]);

  const handleContact = useCallback((profile: any) => {
    if (!user) {
      addError("You must be logged in to contact profiles.");
      return;
    }
    
    if (profile.whatsapp) {
      window.open(`https://wa.me/${profile.whatsapp.replace(/[^0-9]/g, '')}`, '_blank');
    } else {
      addError("WhatsApp contact not available for this profile.");
    }
  }, [user, addError]);

  const handleRefresh = useCallback(() => {
    if (!user) {
      addError("You must be logged in to refresh the feed.");
      return;
    }
    
    console.log('🚀 Triggering feed refresh');
    setRefreshKey(prev => prev + 1);
    toast({
      title: "Feed refreshed!",
      description: "Latest content loaded",
    });
  }, [user, addError]);

  const getRoleIcon = useCallback(() => {
    if (isAdmin) return <Shield className="w-4 h-4 text-white" />;
    if (isServiceProvider) return <Briefcase className="w-4 h-4 text-white" />;
    return <User className="w-4 h-4 text-white" />;
  }, [isAdmin, isServiceProvider]);

  const getRoleColor = useCallback(() => {
    if (isAdmin) return 'bg-red-600';
    if (isServiceProvider) return 'bg-purple-600';
    return 'bg-purple-600';
  }, [isAdmin, isServiceProvider]);

  // NOW WE CAN HAVE CONDITIONAL RENDERING AFTER ALL HOOKS
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
    <ErrorBoundary onError={handleError}>
      <div className="min-h-screen">
        <header className="fixed top-0 left-0 right-0 z-40 bg-black/80 backdrop-blur-md border-b border-gray-700">
          <div className="p-4 flex justify-between items-center max-w-md mx-auto">
            <div className="flex items-center space-x-3">
              <Heart className="w-8 h-8 text-pink-500" />
              <div>
                <h1 className="text-2xl font-bold text-white">Connect</h1>
                <p className="text-xs text-gray-400">Real-time feed</p>
              </div>
              {isAdmin && (
                <span className="bg-red-600 text-white px-2 py-1 rounded-full text-xs font-bold">
                  ADMIN
                </span>
              )}
            </div>
            
            <div className="flex items-center space-x-2">
              <div className="flex items-center space-x-2 bg-black/20 backdrop-blur-md rounded-full px-3 py-2 border border-gray-700">
                <div className={`w-8 h-8 ${getRoleColor()} rounded-full flex items-center justify-center`}>
                  {getRoleIcon()}
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

        <ErrorBoundary 
          fallback={
            <div className="text-center p-8">
              <p className="text-white">Feed temporarily unavailable</p>
              <Button onClick={() => window.location.reload()} className="mt-4">
                Refresh Page
              </Button>
            </div>
          }
        >
          <InstagramFeed
            onLike={handleLike}
            onContact={handleContact}
            onRefresh={handleRefresh}
            likedItems={likedItems}
            key={refreshKey}
          />
        </ErrorBoundary>
      </div>
    </ErrorBoundary>
  );
};

export default Index;
