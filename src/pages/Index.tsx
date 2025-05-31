
import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Heart, RotateCcw, User, LogOut, Settings, Briefcase, Shield } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import OnlineStatus from '@/components/OnlineStatus';
import InstagramFeed from '@/components/InstagramFeed';
import { usePresence } from '@/hooks/usePresence';
import { useUserRole } from '@/hooks/useUserRole';
import { toast } from '@/hooks/use-toast';

const Index = () => {
  const { user, signOut } = useAuth();
  const { isUserOnline } = usePresence();
  const { role, isAdmin, isServiceProvider, loading: roleLoading } = useUserRole();
  const navigate = useNavigate();
  const [likedItems, setLikedItems] = useState<Set<string>>(new Set());

  // Check if user is logged in
  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-purple-900 flex items-center justify-center">
        <div className="text-center p-8">
          <h2 className="text-2xl font-bold text-white mb-4">Please log in to access the feed</h2>
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

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/auth');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const handleDashboard = () => {
    navigate('/dashboard');
  };

  const handleLike = (itemId: string, profileId: number) => {
    // Role-based access control
    if (!isAdmin && role !== 'service_provider' && role !== 'user') {
      toast({
        title: "Access denied",
        description: "You must be logged in with a valid role to like profiles.",
        variant: "destructive",
      });
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
  };

  const handleContact = (profile: any) => {
    // Role-based access control
    if (!isAdmin && role !== 'service_provider' && role !== 'user') {
      toast({
        title: "Access denied",
        description: "You must be logged in with a valid role to contact profiles.",
        variant: "destructive",
      });
      return;
    }

    window.open(`https://wa.me/${profile.whatsapp.replace(/[^0-9]/g, '')}`, '_blank');
  };

  const handleRefresh = () => {
    // Role-based access control
    if (!isAdmin && role !== 'service_provider' && role !== 'user') {
      toast({
        title: "Access denied",
        description: "You must be logged in with a valid role to refresh the feed.",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Feed refreshed",
      description: "Loading new profiles...",
    });
    
    // Simple page reload
    window.location.reload();
  };

  const getRoleIcon = () => {
    if (isAdmin) return <Shield className="w-4 h-4 text-white" />;
    if (isServiceProvider) return <Briefcase className="w-4 h-4 text-white" />;
    return <User className="w-4 h-4 text-white" />;
  };

  const getRoleColor = () => {
    if (isAdmin) return 'bg-red-600';
    if (isServiceProvider) return 'bg-purple-600';
    return 'bg-purple-600';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-purple-900">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-md border-b border-gray-700">
        <div className="p-4 flex justify-between items-center max-w-md mx-auto">
          <div className="flex items-center space-x-3">
            <Heart className="w-8 h-8 text-pink-500" />
            <h1 className="text-2xl font-bold text-white">Connect</h1>
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
            
            <Button
              onClick={handleSignOut}
              variant="ghost"
              size="sm"
              className="text-white hover:bg-white/10"
            >
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="pt-20">
        {isServiceProvider ? (
          // Service Provider View
          <div className="text-center p-4">
            <div className="max-w-md mx-auto">
              <div className="bg-black/20 backdrop-blur-md rounded-lg p-8 border border-gray-700">
                <Briefcase className="w-16 h-16 text-purple-500 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-white mb-4">Service Provider Dashboard</h2>
                <p className="text-gray-400 mb-6">
                  Manage your posts, promotions, and reach more customers.
                </p>
                <Button
                  onClick={handleDashboard}
                  className="w-full bg-purple-600 hover:bg-purple-700"
                >
                  Go to Dashboard
                </Button>
              </div>
            </div>
          </div>
        ) : (
          // Regular User/Admin View - Instagram-style Feed
          <InstagramFeed 
            onLike={handleLike}
            onContact={handleContact}
            onRefresh={handleRefresh}
            likedItems={likedItems}
          />
        )}
      </main>
    </div>
  );
};

export default Index;
