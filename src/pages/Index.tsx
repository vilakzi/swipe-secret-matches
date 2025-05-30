import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useProfileCompletion } from '@/hooks/useProfileCompletion';
import { usePresence } from '@/hooks/usePresence';
import ProfileCard from '../components/ProfileCard';
import MatchModal from '../components/MatchModal';
import PaymentModal from '../components/PaymentModal';
import ProfileCompletionBanner from '../components/ProfileCompletionBanner';
import OnlineStatus from '../components/OnlineStatus';
import { Heart, X, Settings, User, LogOut, Edit, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useNavigate } from 'react-router-dom';

interface Profile {
  id: string;
  display_name: string;
  age: number;
  bio: string;
  whatsapp: string;
  location: string;
  profile_image_url?: string;
  liked?: boolean;
}

const Index = () => {
  const { user, signOut } = useAuth();
  const { isComplete, missingFields, loading: profileLoading } = useProfileCompletion();
  const { isUserOnline } = usePresence();
  const navigate = useNavigate();
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [matches, setMatches] = useState<Profile[]>([]);
  const [showMatch, setShowMatch] = useState(false);
  const [lastMatch, setLastMatch] = useState<Profile | null>(null);
  const [showPayment, setShowPayment] = useState(false);
  const [isSwipingDisabled, setIsSwipingDisabled] = useState(false);
  const [swipeCount, setSwipeCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (user && !profileLoading) {
      fetchProfiles();
    }
  }, [user, profileLoading]);

  // Disable swiping if profile is incomplete
  useEffect(() => {
    if (!profileLoading && !isComplete) {
      setIsSwipingDisabled(true);
    } else if (!profileLoading && isComplete) {
      setIsSwipingDisabled(false);
    }
  }, [isComplete, profileLoading]);

  const fetchProfiles = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .neq('id', user?.id)
        .limit(20);

      if (error) throw error;

      // Transform data to match expected interface
      const transformedProfiles = data?.map(profile => ({
        id: profile.id,
        display_name: profile.display_name || 'Anonymous',
        age: profile.age || 25,
        bio: profile.bio || 'Hello there! 👋',
        whatsapp: profile.whatsapp || '',
        location: profile.location || 'Unknown',
        profile_image_url: profile.profile_image_url || `https://images.unsplash.com/photo-${Math.random() > 0.5 ? '1494790108755-2616b612b566' : '1438761681033-6461ffad8d80'}?w=400&h=600&fit=crop`,
        liked: false
      })) || [];

      if (isRefresh) {
        setProfiles(transformedProfiles);
        setSwipeCount(0);
        toast({
          title: "Refreshed!",
          description: "New profiles loaded",
        });
      } else {
        setProfiles(transformedProfiles);
      }
    } catch (error: any) {
      toast({
        title: "Error loading profiles",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleSwipe = async (profileId: string, direction: 'left' | 'right') => {
    if (isSwipingDisabled || !user) return;

    const profile = profiles.find(p => p.id === profileId);
    if (!profile) return;

    const newSwipeCount = swipeCount + 1;
    setSwipeCount(newSwipeCount);

    // Mark profile as liked in the UI but don't remove it
    if (direction === 'right') {
      setProfiles(prev => prev.map(p => 
        p.id === profileId ? { ...p, liked: true } : p
      ));
    }

    try {
      // Record the swipe
      await supabase
        .from('swipes')
        .insert({
          user_id: user.id,
          target_user_id: profile.id,
          liked: direction === 'right'
        });

      if (direction === 'right') {
        // Check if target user already liked this user
        const { data: mutualLike } = await supabase
          .from('swipes')
          .select('*')
          .eq('user_id', profile.id)
          .eq('target_user_id', user.id)
          .eq('liked', true)
          .single();

        if (mutualLike) {
          // Create match
          await supabase
            .from('matches')
            .insert({
              user1_id: user.id,
              user2_id: profile.id
            });

          setMatches(prev => [...prev, profile]);
          setLastMatch(profile);
          setShowMatch(true);
        }
      }
    } catch (error: any) {
      console.error('Error recording swipe:', error);
    }

    // Show paywall after 5 swipes
    if (newSwipeCount >= 5) {
      setIsSwipingDisabled(true);
      setShowPayment(true);
      return;
    }
  };

  const handlePaymentSuccess = () => {
    setShowPayment(false);
    setIsSwipingDisabled(false);
    setSwipeCount(0);
  };

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error: any) {
      toast({
        title: "Error signing out",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const handleRefresh = () => {
    fetchProfiles(true);
  };

  if (loading || profileLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-purple-900 flex items-center justify-center">
        <div className="text-white text-lg">Loading profiles...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-purple-900 text-white">
      {/* Header */}
      <div className="flex justify-between items-center p-4 bg-black/20 backdrop-blur-md sticky top-0 z-10">
        <div className="flex items-center space-x-2">
          <Heart className="w-6 h-6 text-pink-500" />
          <span className="text-xl font-bold">Connect</span>
        </div>
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="sm"
            className="text-white hover:bg-white/10"
            onClick={handleRefresh}
            disabled={refreshing}
          >
            <RefreshCw className={`w-5 h-5 ${refreshing ? 'animate-spin' : ''}`} />
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="text-white hover:bg-white/10 relative">
                <User className="w-5 h-5" />
                {user && (
                  <div className="absolute -top-1 -right-1">
                    <OnlineStatus isOnline={isUserOnline(user.id)} size="sm" />
                  </div>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="bg-gray-800 border-gray-700">
              <DropdownMenuItem 
                onClick={() => navigate('/profile')} 
                className="text-white hover:bg-gray-700"
              >
                <Edit className="w-4 h-4 mr-2" />
                Edit Profile
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleSignOut} className="text-white hover:bg-gray-700">
                <LogOut className="w-4 h-4 mr-2" />
                Sign Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Profile Completion Banner */}
      <div className="px-4 py-2">
        <ProfileCompletionBanner missingFields={missingFields} />
      </div>

      {/* Scrollable Feed */}
      <ScrollArea className="h-[calc(100vh-120px)]">
        <div className="flex flex-col items-center space-y-6 p-4">
          {profiles.length > 0 ? (
            profiles.map((profile) => (
              <div key={profile.id} className="w-full flex justify-center">
                <ProfileCard 
                  profile={{
                    id: parseInt(profile.id),
                    name: profile.display_name,
                    age: profile.age,
                    image: profile.profile_image_url || '',
                    bio: profile.bio,
                    whatsapp: profile.whatsapp,
                    location: profile.location,
                    liked: profile.liked
                  }}
                  onSwipe={(direction) => handleSwipe(profile.id, direction)}
                  disabled={isSwipingDisabled}
                />
              </div>
            ))
          ) : (
            <div className="text-center py-8">
              <Heart className="w-16 h-16 text-pink-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold mb-2">No profiles available</h2>
              <p className="text-gray-400 mb-4">Check back later for more connections</p>
              <Button 
                className="bg-purple-600 hover:bg-purple-700"
                onClick={handleRefresh}
                disabled={refreshing}
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            </div>
          )}

          {/* Paywall Notice */}
          {swipeCount >= 3 && !isSwipingDisabled && isComplete && (
            <div className="text-center mt-4 p-3 bg-purple-500/20 rounded-lg backdrop-blur-md max-w-md">
              <p className="text-sm text-purple-200">
                {5 - swipeCount} swipes remaining before premium required
              </p>
            </div>
          )}

          {/* Profile Incomplete Notice */}
          {!isComplete && (
            <div className="text-center mt-4 p-3 bg-orange-500/20 rounded-lg backdrop-blur-md max-w-md">
              <p className="text-sm text-orange-200">
                Complete your profile to start swiping!
              </p>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Match Modal */}
      {showMatch && lastMatch && (
        <MatchModal
          profile={{
            id: parseInt(lastMatch.id),
            name: lastMatch.display_name,
            age: lastMatch.age,
            image: lastMatch.profile_image_url || '',
            bio: lastMatch.bio,
            whatsapp: lastMatch.whatsapp,
            location: lastMatch.location
          }}
          onClose={() => setShowMatch(false)}
        />
      )}

      {/* Payment Modal */}
      {showPayment && (
        <PaymentModal
          onSuccess={handlePaymentSuccess}
          onClose={() => setShowPayment(false)}
        />
      )}
    </div>
  );
};

export default Index;
