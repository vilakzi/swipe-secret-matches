import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Heart, RotateCcw, User, LogOut, Settings, Briefcase, Shield } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import OnlineStatus from '@/components/OnlineStatus';
import InstagramFeed from '@/components/InstagramFeed';
import ProfileCompletionPrompt from '@/components/onboarding/ProfileCompletionPrompt';
import { usePresence } from '@/hooks/usePresence';
import { useUserRole } from '@/hooks/useUserRole';
import { toast } from '@/hooks/use-toast';
import { useError } from "@/components/common/ErrorTaskBar";

const Index = () => {
  const { user, signOut } = useAuth();
  const { isUserOnline } = usePresence();
  const { role, isAdmin, isServiceProvider, loading: roleLoading } = useUserRole();
  const navigate = useNavigate();
  const [likedItems, setLikedItems] = useState<Set<string>>(new Set());
  const [refreshKey, setRefreshKey] = useState(0);

  const { addError } = useError();

  // Show loading state while checking authentication
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

  const handleDashboard = () => {
    navigate('/dashboard');
  };

  const handleLike = (itemId: string, profileId: string) => {
    // Allow likes for all authenticated users with valid roles
    if (!user || (!isAdmin && !['service_provider', 'user'].includes(role || ''))) {
      addError("You must be logged in with a valid role to like profiles.");
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
    if (!user || (!isAdmin && !['service_provider', 'user'].includes(role || ''))) {
      addError("You must be logged in with a valid role to contact profiles.");
      return;
    }
    
    if (profile.whatsapp) {
      window.open(`https://wa.me/${profile.whatsapp.replace(/[^0-9]/g, '')}`, '_blank');
    } else {
      addError("WhatsApp contact not available for this profile.");
    }
  };

  const handleRefresh = () => {
    if (!user || (!isAdmin && !['service_provider', 'user'].includes(role || ''))) {
      addError("You must be logged in with a valid role to refresh the feed.");
      return;
    }
    
    console.log('Refreshing feed from Index component');
    setRefreshKey(prev => prev + 1);
    toast({
      title: "Feed refreshed",
      description: "Loading new profiles...",
    });
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
    <div className="min-h-screen">
      {/* Simplified Header */}
      <header className="fixed top-0 left-0 right-0 z-40 bg-black/80 backdrop-blur-md border-b border-gray-700">
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
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="pt-20">
        {/* Show Instagram-style Feed for all users including service providers */}
        <div className="max-w-md mx-auto px-4">
          <ProfileCompletionPrompt />
          <InstagramFeed 
            key={refreshKey}
            onLike={handleLike}
            onContact={handleContact}
            onRefresh={handleRefresh}
            likedItems={likedItems}
          />
        </div>
      </main>
    </div>
  );
};

export default Index;
