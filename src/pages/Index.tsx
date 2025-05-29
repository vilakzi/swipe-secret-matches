
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useProfileCompletion } from '@/hooks/useProfileCompletion';
import ProfileCard from '../components/ProfileCard';
import MatchModal from '../components/MatchModal';
import PaymentModal from '../components/PaymentModal';
import ProfileCompletionBanner from '../components/ProfileCompletionBanner';
import { Heart, X, Settings, User, LogOut, Edit } from 'lucide-react';
import { Button } from '@/components/ui/button';
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
}

const Index = () => {
  const { user, signOut } = useAuth();
  const { isComplete, missingFields, loading: profileLoading } = useProfileCompletion();
  const navigate = useNavigate();
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [matches, setMatches] = useState<Profile[]>([]);
  const [showMatch, setShowMatch] = useState(false);
  const [lastMatch, setLastMatch] = useState<Profile | null>(null);
  const [showPayment, setShowPayment] = useState(false);
  const [isSwipingDisabled, setIsSwipingDisabled] = useState(false);
  const [swipeCount, setSwipeCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const currentProfile = profiles[currentIndex];

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

  const fetchProfiles = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .neq('id', user?.id)
        .limit(10);

      if (error) throw error;

      // Transform data to match expected interface
      const transformedProfiles = data?.map(profile => ({
        id: profile.id,
        display_name: profile.display_name || 'Anonymous',
        age: profile.age || 25,
        bio: profile.bio || 'Hello there! 👋',
        whatsapp: profile.whatsapp || '',
        location: profile.location || 'Unknown',
        profile_image_url: profile.profile_image_url || `https://images.unsplash.com/photo-${Math.random() > 0.5 ? '1494790108755-2616b612b566' : '1438761681033-6461ffad8d80'}?w=400&h=600&fit=crop`
      })) || [];

      setProfiles(transformedProfiles);
    } catch (error: any) {
      toast({
        title: "Error loading profiles",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSwipe = async (direction: 'left' | 'right') => {
    if (isSwipingDisabled || !currentProfile || !user) return;

    const newSwipeCount = swipeCount + 1;
    setSwipeCount(newSwipeCount);

    try {
      // Record the swipe
      await supabase
        .from('swipes')
        .insert({
          user_id: user.id,
          target_user_id: currentProfile.id,
          liked: direction === 'right'
        });

      if (direction === 'right') {
        // Check if target user already liked this user
        const { data: mutualLike } = await supabase
          .from('swipes')
          .select('*')
          .eq('user_id', currentProfile.id)
          .eq('target_user_id', user.id)
          .eq('liked', true)
          .single();

        if (mutualLike) {
          // Create match
          await supabase
            .from('matches')
            .insert({
              user1_id: user.id,
              user2_id: currentProfile.id
            });

          setMatches(prev => [...prev, currentProfile]);
          setLastMatch(currentProfile);
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

    setCurrentIndex(prev => prev + 1);
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
      <div className="flex justify-between items-center p-4 bg-black/20 backdrop-blur-md">
        <div className="flex items-center space-x-2">
          <Heart className="w-6 h-6 text-pink-500" />
          <span className="text-xl font-bold">Connect</span>
        </div>
        <div className="flex items-center space-x-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="text-white hover:bg-white/10">
                <User className="w-5 h-5" />
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

      {/* Main Content */}
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-80px)] p-4">
        {/* Profile Completion Banner */}
        <div className="w-full max-w-md mb-4">
          <ProfileCompletionBanner missingFields={missingFields} />
        </div>

        {currentProfile && currentIndex < profiles.length ? (
          <div className="relative">
            <ProfileCard 
              profile={{
                id: parseInt(currentProfile.id),
                name: currentProfile.display_name,
                age: currentProfile.age,
                image: currentProfile.profile_image_url || '',
                bio: currentProfile.bio,
                whatsapp: currentProfile.whatsapp,
                location: currentProfile.location
              }}
              onSwipe={handleSwipe}
              disabled={isSwipingDisabled}
            />
            
            {/* Action Buttons */}
            <div className="flex justify-center space-x-8 mt-8">
              <Button
                size="lg"
                variant="outline"
                className="rounded-full w-16 h-16 border-red-500 text-red-500 hover:bg-red-500 hover:text-white transition-colors"
                onClick={() => handleSwipe('left')}
                disabled={isSwipingDisabled}
              >
                <X className="w-8 h-8" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="rounded-full w-16 h-16 border-green-500 text-green-500 hover:bg-green-500 hover:text-white transition-colors"
                onClick={() => handleSwipe('right')}
                disabled={isSwipingDisabled}
              >
                <Heart className="w-8 h-8" />
              </Button>
            </div>

            {/* Paywall Notice */}
            {swipeCount >= 3 && !isSwipingDisabled && isComplete && (
              <div className="text-center mt-4 p-3 bg-purple-500/20 rounded-lg backdrop-blur-md">
                <p className="text-sm text-purple-200">
                  {5 - swipeCount} swipes remaining before premium required
                </p>
              </div>
            )}

            {/* Profile Incomplete Notice */}
            {!isComplete && (
              <div className="text-center mt-4 p-3 bg-orange-500/20 rounded-lg backdrop-blur-md">
                <p className="text-sm text-orange-200">
                  Complete your profile to start swiping!
                </p>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center">
            <Heart className="w-16 h-16 text-pink-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">No more profiles!</h2>
            <p className="text-gray-400">Check back later for more connections</p>
            <Button 
              className="mt-4 bg-purple-600 hover:bg-purple-700"
              onClick={() => {
                setCurrentIndex(0);
                setSwipeCount(0);
                setIsSwipingDisabled(!isComplete);
                fetchProfiles();
              }}
            >
              Refresh
            </Button>
          </div>
        )}
      </div>

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
