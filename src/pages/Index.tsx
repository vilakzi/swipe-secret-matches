import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Heart, RotateCcw, User, LogOut, Settings, Briefcase, Shield } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import ProfileCard from '@/components/ProfileCard';
import OnlineStatus from '@/components/OnlineStatus';
import PaywallModal from '@/components/PaywallModal';
import UsageCounter from '@/components/UsageCounter';
import { usePresence } from '@/hooks/usePresence';
import { useSubscription, useUsageTracking } from '@/hooks/useSubscription';
import { useUserRole } from '@/hooks/useUserRole';

interface Profile {
  id: number;
  name: string;
  age: number;
  image: string;
  bio: string;
  whatsapp: string;
  location: string;
  liked?: boolean;
}

const mockProfiles: Profile[] = [
  {
    id: 1,
    name: 'Alice',
    age: 28,
    image: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxzZWFyY2h8M3x8cGVvcGxlfGVufDB8fDB8fA%3D%3D&auto=format&fit=crop&w=500&q=60',
    bio: 'Loves hiking and photography. Looking for someone to explore the outdoors with.',
    whatsapp: '+15551234567',
    location: 'New York, NY',
  },
  {
    id: 2,
    name: 'Bob',
    age: 32,
    image: 'https://images.unsplash.com/photo-1500648767791-00d0cb3c60c5?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxzZWFyY2h8Nnx8cGVvcGxlfGVufDB8fDB8fA%3D%3D&auto=format&fit=crop&w=500&q=60',
    bio: 'Enjoys cooking and trying new restaurants. Seeking a partner to share culinary adventures.',
    whatsapp: '+15559876543',
    location: 'Los Angeles, CA',
  },
  {
    id: 3,
    name: 'Charlie',
    age: 25,
    image: 'https://images.unsplash.com/photo-1534528741702-a0cfae562c9c?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxzZWFyY2h8MTB8fHBlb3BsZXxlbnwwfHwwfHw%3D&auto=format&fit=crop&w=500&q=60',
    bio: 'Passionate about music and concerts. Hoping to find someone to rock out with.',
    whatsapp: '+15551112233',
    location: 'Chicago, IL',
  },
];

const Index = () => {
  const { user, signOut } = useAuth();
  const { isUserOnline } = usePresence();
  const { role, isAdmin, isServiceProvider, loading: roleLoading } = useUserRole();
  const navigate = useNavigate();
  const [currentProfileIndex, setCurrentProfileIndex] = useState(0);
  const [likedProfiles, setLikedProfiles] = useState<Set<number>>(new Set());
  const [showPaywall, setShowPaywall] = useState(false);
  const [paywallTrigger, setPaywallTrigger] = useState<'interaction' | 'scroll_limit' | 'initial'>('initial');
  
  const { subscribed, loading: subscriptionLoading } = useSubscription();
  const { scrollsToday, remainingScrolls, trackScroll } = useUsageTracking();

  // Show initial paywall for new non-subscribed regular users (not admins)
  useEffect(() => {
    if (!subscriptionLoading && !subscribed && user && role === 'user' && !isAdmin && !roleLoading) {
      setTimeout(() => {
        setPaywallTrigger('initial');
        setShowPaywall(true);
      }, 2000);
    }
  }, [subscribed, subscriptionLoading, user, role, isAdmin, roleLoading]);

  const handleSwipe = async (direction: 'left' | 'right') => {
    // Admins have unlimited access
    if (!isAdmin && !subscribed) {
      setPaywallTrigger('interaction');
      setShowPaywall(true);
      return;
    }

    if (direction === 'right') {
      setLikedProfiles(prev => new Set(prev).add(mockProfiles[currentProfileIndex].id));
    }
    
    setCurrentProfileIndex((prevIndex) => (prevIndex + 1) % mockProfiles.length);
  };

  const handleRefresh = async () => {
    // Admins bypass all restrictions
    if (!isAdmin && !subscribed) {
      if (remainingScrolls <= 0) {
        setPaywallTrigger('scroll_limit');
        setShowPaywall(true);
        return;
      }

      const canContinue = await trackScroll();
      if (!canContinue) {
        setPaywallTrigger('scroll_limit');
        setShowPaywall(true);
        return;
      }
    }

    setCurrentProfileIndex(0);
  };

  const handleProfileNavigation = async () => {
    // Admins have unlimited navigation
    if (!isAdmin && !subscribed) {
      if (remainingScrolls <= 0) {
        setPaywallTrigger('scroll_limit');
        setShowPaywall(true);
        return false;
      }

      const canContinue = await trackScroll();
      if (!canContinue) {
        setPaywallTrigger('scroll_limit');
        setShowPaywall(true);
        return false;
      }
    }

    setCurrentProfileIndex((prevIndex) => (prevIndex + 1) % mockProfiles.length);
    return true;
  };

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

  if (!user) {
    return null;
  }

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
      <header className="p-4 flex justify-between items-center">
        <div className="flex items-center space-x-3">
          <Heart className="w-8 h-8 text-pink-500" />
          <h1 className="text-2xl font-bold text-white">Connect</h1>
          {isAdmin && (
            <span className="bg-red-600 text-white px-2 py-1 rounded-full text-xs font-bold">
              ADMIN
            </span>
          )}
        </div>
        
        <div className="flex items-center space-x-4">
          <Button
            onClick={handleRefresh}
            variant="ghost"
            size="sm"
            className="text-white hover:bg-white/10"
          >
            <RotateCcw className="w-4 h-4" />
          </Button>
          
          <div className="flex items-center space-x-3 bg-black/20 backdrop-blur-md rounded-full px-4 py-2 border border-gray-700">
            <div className="flex items-center space-x-2">
              <div className={`w-8 h-8 ${getRoleColor()} rounded-full flex items-center justify-center`}>
                {getRoleIcon()}
              </div>
              <OnlineStatus 
                isOnline={isUserOnline(user.id)} 
                size="sm"
              />
            </div>
            
            <div className="flex items-center space-x-2">
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
        </div>
      </header>

      {/* Usage Counter for regular users (not admins) */}
      {role === 'user' && !isAdmin && (
        <div className="px-4 mb-4">
          <UsageCounter 
            scrollsToday={scrollsToday}
            remainingScrolls={remainingScrolls}
            isSubscribed={subscribed}
          />
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 p-4">
        {isServiceProvider ? (
          // Service Provider View
          <div className="text-center">
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
          // Regular User/Admin View - Profile Cards
          <div className="flex justify-center">
            {mockProfiles.length > 0 ? (
              <ProfileCard
                profile={mockProfiles[currentProfileIndex]}
                onSwipe={handleSwipe}
                onNavigate={handleProfileNavigation}
                isSubscribed={subscribed || isAdmin} // Admins get unlimited access
              />
            ) : (
              <div className="text-center text-white">
                <Heart className="w-16 h-16 text-pink-500 mx-auto mb-4" />
                <h2 className="text-2xl font-bold mb-2">No more profiles</h2>
                <p className="text-gray-400 mb-4">Check back later for new matches!</p>
                <Button
                  onClick={handleRefresh}
                  className="bg-pink-600 hover:bg-pink-700"
                >
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Refresh
                </Button>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Paywall Modal - Don't show to admins */}
      {!isAdmin && (
        <PaywallModal
          isOpen={showPaywall}
          onClose={() => setShowPaywall(false)}
          trigger={paywallTrigger}
          remainingScrolls={remainingScrolls}
        />
      )}
    </div>
  );
};

export default Index;
