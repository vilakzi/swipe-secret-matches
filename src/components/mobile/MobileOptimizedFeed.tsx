
import React, { useState, useCallback, useMemo } from 'react';
import { useIsMobile } from '@/hooks/use-mobile';
import { useMobileOptimization } from '@/hooks/useMobileOptimization';
import MobilePullToRefresh from './MobilePullToRefresh';
import MobileSwipeCard from './MobileSwipeCard';
import PostCard from '../feed/PostCard';
import { Profile } from '@/components/feed/types/feedTypes';

interface MobileOptimizedFeedProps {
  profiles: Profile[];
  onLike: (itemId: string, profileId: string) => void;
  onContact: (profile: Profile) => void;
  onRefresh: () => Promise<void>;
  likedItems: Set<string>;
  isSubscribed: boolean;
  engagementTracker?: any;
}

const MobileOptimizedFeed: React.FC<MobileOptimizedFeedProps> = ({
  profiles,
  onLike,
  onContact,
  onRefresh,
  likedItems,
  isSubscribed,
  engagementTracker,
}) => {
  const isMobile = useIsMobile();
  const {
    config,
    shouldUseAnimation,
    shouldOptimizeImages,
    vibrate,
  } = useMobileOptimization({
    enablePullToRefresh: true,
    enableSwipeGestures: true,
    enableHapticFeedback: true,
    optimizeImages: true,
  });

  const [currentProfileIndex, setCurrentProfileIndex] = useState(0);
  const [isSwipeMode, setIsSwipeMode] = useState(isMobile);

  // Convert profiles to feed items
  const feedItems = useMemo(() => {
    return profiles.map(profile => ({
      id: profile.id,
      type: 'profile' as const,
      profile,
    }));
  }, [profiles]);

  const currentProfile = profiles[currentProfileIndex];

  const handleSwipeAction = useCallback((action: 'like' | 'pass' | 'super') => {
    if (!currentProfile) return;

    // Haptic feedback
    if (action === 'like') {
      vibrate(50);
    } else if (action === 'super') {
      vibrate([50, 50, 50]);
    } else {
      vibrate(30);
    }

    // Track engagement
    engagementTracker?.trackEngagement(currentProfile.id, action);

    // Handle the action
    if (action === 'like') {
      onLike(currentProfile.id, currentProfile.id);
    }

    // Move to next profile
    setCurrentProfileIndex(prev => Math.min(prev + 1, profiles.length - 1));
  }, [currentProfile, profiles.length, onLike, vibrate, engagementTracker]);

  const handleProfileClick = useCallback(() => {
    if (currentProfile) {
      // Navigate to profile (you can implement this)
      console.log('Navigate to profile:', currentProfile.id);
    }
  }, [currentProfile]);

  if (!isMobile || !isSwipeMode) {
    // Desktop or feed mode - show traditional post cards
    return (
      <MobilePullToRefresh onRefresh={onRefresh}>
        <div className="space-y-4 p-4">
          {feedItems.map((item) => (
            <PostCard
              key={item.id}
              item={item}
              likedItems={likedItems}
              isSubscribed={isSubscribed}
              onLike={onLike}
              onContact={onContact}
              engagementTracker={engagementTracker}
            />
          ))}
        </div>
      </MobilePullToRefresh>
    );
  }

  // Mobile swipe mode
  return (
    <MobilePullToRefresh onRefresh={onRefresh}>
      <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gradient-to-br from-gray-900 via-gray-800 to-purple-900">
        {currentProfile ? (
          <MobileSwipeCard
            profile={{
              id: currentProfile.id,
              name: currentProfile.name,
              age: currentProfile.age,
              image: shouldOptimizeImages 
                ? currentProfile.image.replace(/\/w_\d+,h_\d+/, '/w_800,h_600')
                : currentProfile.image,
              bio: currentProfile.bio,
              location: currentProfile.location,
            }}
            onLike={() => handleSwipeAction('like')}
            onPass={() => handleSwipeAction('pass')}
            onSuperLike={() => handleSwipeAction('super')}
            onProfileClick={handleProfileClick}
          />
        ) : (
          <div className="text-center text-gray-400">
            <h2 className="text-xl font-semibold mb-2">No more profiles</h2>
            <p>Pull down to refresh and discover new people!</p>
          </div>
        )}

        {/* Progress indicator */}
        <div className="mt-6 flex items-center space-x-2">
          {profiles.slice(0, 5).map((_, index) => (
            <div
              key={index}
              className={`w-2 h-2 rounded-full transition-colors ${
                index <= currentProfileIndex ? 'bg-purple-500' : 'bg-gray-600'
              }`}
            />
          ))}
        </div>

        {/* Mode toggle */}
        <button
          onClick={() => setIsSwipeMode(false)}
          className="mt-4 text-gray-400 text-sm underline"
        >
          Switch to Feed Mode
        </button>
      </div>
    </MobilePullToRefresh>
  );
};

export default MobileOptimizedFeed;
