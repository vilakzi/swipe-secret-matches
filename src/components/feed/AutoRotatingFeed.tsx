
import React, { useState, useEffect } from 'react';
import { useFeedRotation } from '@/hooks/useFeedRotation';
import { FeedItem, Profile } from './types/feedTypes';
import PostCard from './PostCard';
import ProfileCard from './ProfileCard';
import ContentProfileCard from './ContentProfileCard';
import { ChevronLeft, ChevronRight, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface AutoRotatingFeedProps {
  feedItems: FeedItem[];
  likedItems: Set<string>;
  isSubscribed: boolean;
  onLike: (itemId: string, profileId: string) => void;
  onContact: (profile: Profile) => void;
  onContentLike?: (contentId: string, profileId: string) => void;
  onContentShare?: (contentId: string) => void;
  itemsPerView?: number;
  showControls?: boolean;
}

const AutoRotatingFeed: React.FC<AutoRotatingFeedProps> = ({
  feedItems,
  likedItems,
  isSubscribed,
  onLike,
  onContact,
  onContentLike,
  onContentShare,
  itemsPerView = 3,
  showControls = true
}) => {
  const [isPaused, setIsPaused] = useState(false);
  
  const {
    rotatedFeed,
    currentRotationIndex,
    getVisibleItems,
    refreshRotation,
    isRotating
  } = useFeedRotation(feedItems, {
    rotationInterval: isPaused ? 0 : 8000,
    superAdminBoost: 3,
    maxConsecutivePosts: 2
  });

  const visibleItems = getVisibleItems(itemsPerView);

  const handleManualRotation = (direction: 'next' | 'prev') => {
    // Manual rotation logic can be implemented here if needed
    refreshRotation();
  };

  const renderFeedItem = (item: any, index: number) => {
    const key = `${item.id || item.profile?.id || 'unknown'}-${currentRotationIndex + index}`;
    
    // Handle content feed items
    if (item.isContent) {
      return (
        <ContentProfileCard
          key={key}
          item={item}
          likedItems={likedItems}
          onLike={(contentId: string) => onContentLike?.(contentId, item.profile?.id || '')}
          onShare={onContentShare || (() => {})}
        />
      );
    }
    
    // Handle post items
    if (item.type === 'post') {
      return (
        <PostCard
          key={key}
          item={item}
          likedItems={likedItems}
          isSubscribed={isSubscribed}
          onLike={onLike}
          onContact={onContact}
        />
      );
    }
    
    // Handle profile items
    if (item.type === 'profile') {
      return (
        <ProfileCard
          key={key}
          item={item}
          likedItems={likedItems}
          isSubscribed={isSubscribed}
          onLike={onLike}
          onContact={onContact}
        />
      );
    }
    
    return null;
  };

  if (!isRotating || visibleItems.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-400">Loading feed...</p>
      </div>
    );
  }

  return (
    <div 
      className="space-y-4"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {showControls && (
        <div className="flex items-center justify-between mb-4 px-4">
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-400">
              Auto-rotating feed {isPaused ? '(paused)' : '(active)'}
            </span>
            <div className="flex space-x-1">
              {Array.from({ length: Math.min(5, rotatedFeed.length) }).map((_, i) => (
                <div
                  key={i}
                  className={`w-2 h-2 rounded-full transition-colors ${
                    i === (currentRotationIndex % 5) ? 'bg-purple-500' : 'bg-gray-600'
                  }`}
                />
              ))}
            </div>
          </div>
          
          <div className="flex space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleManualRotation('prev')}
              className="text-white border-white/20 hover:bg-white/10"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={refreshRotation}
              className="text-white border-white/20 hover:bg-white/10"
            >
              <RotateCcw className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleManualRotation('next')}
              className="text-white border-white/20 hover:bg-white/10"
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}

      <div className="space-y-4" role="list" aria-label="Auto-rotating feed items">
        {visibleItems.map((item, index) => (
          <div
            key={`${item.id}-${currentRotationIndex + index}`}
            className="transform transition-all duration-500 ease-in-out"
            style={{
              animationDelay: `${index * 100}ms`
            }}
          >
            {renderFeedItem(item, index)}
          </div>
        ))}
      </div>

      {rotatedFeed.length > itemsPerView && (
        <div className="text-center pt-4">
          <p className="text-xs text-gray-500">
            Showing {visibleItems.length} of {rotatedFeed.length} items
          </p>
        </div>
      )}
    </div>
  );
};

export default AutoRotatingFeed;
