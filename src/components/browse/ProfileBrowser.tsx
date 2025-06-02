import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Filter, RotateCcw } from 'lucide-react';
import SwipeCard from './SwipeCard';
import FilterPanel from './FilterPanel';
import UsageCounter from '@/components/UsageCounter';
import { toast } from '@/hooks/use-toast';

interface Profile {
  id: string;
  name: string;
  age: number;
  image: string;
  bio: string;
  location: string;
  interests?: string[];
}

interface ProfileBrowserProps {
  profiles: Profile[];
  onSwipe: (profileId: string, direction: 'left' | 'right', isSuperLike?: boolean) => void;
  onProfileTap?: (profile: Profile) => void;
  onRefresh: () => void;
  dailySwipes: number;
  maxSwipes: number;
  superLikes: number;
  maxSuperLikes: number;
  isLoading?: boolean;
}

const ProfileBrowser = ({
  profiles,
  onSwipe,
  onProfileTap,
  onRefresh,
  dailySwipes,
  maxSwipes,
  superLikes,
  maxSuperLikes,
  isLoading = false
}: ProfileBrowserProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showFilters, setShowFilters] = useState(false);

  const currentProfile = profiles[currentIndex];
  const hasMoreProfiles = currentIndex < profiles.length - 1;

  const handleSwipe = (direction: 'left' | 'right', isSuperLike = false) => {
    if (!currentProfile) return;

    // Check usage limits
    if (isSuperLike && superLikes >= maxSuperLikes) {
      toast({
        title: "Super Likes Limit Reached",
        description: "You've reached your daily super likes limit",
        variant: "destructive"
      });
      return;
    }

    if (!isSuperLike && dailySwipes >= maxSwipes) {
      toast({
        title: "Daily Swipes Limit Reached",
        description: "You've reached your daily swipes limit",
        variant: "destructive"
      });
      return;
    }

    onSwipe(currentProfile.id, direction, isSuperLike);
    
    if (hasMoreProfiles) {
      setCurrentIndex(prev => prev + 1);
    } else {
      // No more profiles
      toast({
        title: "No more profiles",
        description: "You've seen all available profiles for now"
      });
    }
  };

  const handleProfileTap = () => {
    if (currentProfile && onProfileTap) {
      onProfileTap(currentProfile);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
        <p className="text-gray-400">Loading profiles...</p>
      </div>
    );
  }

  if (!currentProfile) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <p className="text-gray-400 text-center">No more profiles to show</p>
        <Button
          onClick={onRefresh}
          variant="outline"
          className="border-gray-600 text-gray-300 hover:bg-gray-800"
        >
          <RotateCcw className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Controls */}
      <div className="flex items-center justify-between">
        <Button
          onClick={() => setShowFilters(true)}
          variant="outline"
          size="sm"
          className="border-gray-600 text-gray-300 hover:bg-gray-800"
        >
          <Filter className="w-4 h-4 mr-2" />
          Filters
        </Button>
        
        <div className="text-center">
          <p className="text-gray-400 text-sm">
            {currentIndex + 1} of {profiles.length}
          </p>
        </div>

        <Button
          onClick={onRefresh}
          variant="outline"
          size="sm"
          className="border-gray-600 text-gray-300 hover:bg-gray-800"
        >
          <RotateCcw className="w-4 h-4" />
        </Button>
      </div>

      {/* Usage Counters */}
      <div className="grid grid-cols-2 gap-4">
        <UsageCounter
          currentUsage={dailySwipes}
          maxUsage={maxSwipes}
          type="swipes"
        />
        <UsageCounter
          currentUsage={superLikes}
          maxUsage={maxSuperLikes}
          type="super_likes"
        />
      </div>

      {/* Profile Card */}
      <SwipeCard
        profile={currentProfile}
        onSwipe={handleSwipe}
        onTap={handleProfileTap}
        disabled={isLoading}
      />

      {/* Filter Panel */}
      <FilterPanel
        isOpen={showFilters}
        onClose={() => setShowFilters(false)}
      />
    </div>
  );
};

export default ProfileBrowser;
