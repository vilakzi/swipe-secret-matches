
import React, { useState, useCallback } from 'react';
import FeedHeader from './feed/FeedHeader';
import FeedContent from './feed/FeedContent';
import PullToRefresh from './feed/PullToRefresh';
import InfiniteScroll from './feed/InfiniteScroll';
import { useDynamicFeedEngine } from '@/hooks/useDynamicFeedEngine';
import { toast } from '@/hooks/use-toast';

interface InstagramFeedProps {
  onLike: (itemId: string, profileId: string) => void;
  onContact: (profile: any) => void;
  onRefresh: () => void;
  likedItems: Set<string>;
}

const InstagramFeed = ({ onLike, onContact, onRefresh, likedItems }: InstagramFeedProps) => {
  const [showFilters, setShowFilters] = useState(false);
  
  // Use dynamic feed engine for continuous, never-ending content
  const {
    displayedItems,
    hasMoreItems,
    isLoadingMore,
    handleLoadMore,
    handleRefresh,
    engagementTracker,
    feedEngineStats
  } = useDynamicFeedEngine();

  const handlePullRefresh = useCallback(async () => {
    console.log('🔄 Pull refresh - generating fresh content flow');
    handleRefresh();
    await new Promise(resolve => setTimeout(resolve, 1000));
    onRefresh();
  }, [handleRefresh, onRefresh]);

  const handleSmartRefresh = useCallback(() => {
    console.log('🔄 Smart refresh - ensuring dynamic content rotation');
    handleRefresh();
    onRefresh();
    toast({
      title: "Fresh content loaded!",
      description: `Dynamic feed refreshed with ${feedEngineStats.poolSize} items in rotation`,
    });
  }, [handleRefresh, onRefresh, feedEngineStats.poolSize]);

  console.log('🚀 InstagramFeed rendering with dynamic engine:', {
    displayedItems: displayedItems.length,
    hasMore: hasMoreItems,
    isLoading: isLoadingMore,
    engineStats: feedEngineStats
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-purple-900 overflow-x-hidden">
      <FeedHeader
        showFilters={showFilters}
        setShowFilters={setShowFilters}
        onImageUpload={() => console.log('Image upload initiated')}
        onVideoUpload={() => console.log('Video upload initiated')}
        onRefresh={handleSmartRefresh}
      />
      
      <div className="max-w-md mx-auto">
        <PullToRefresh onRefresh={handlePullRefresh} className="pt-20">
          <InfiniteScroll
            hasMore={hasMoreItems}
            isLoading={isLoadingMore}
            onLoadMore={handleLoadMore}
            threshold={200} // Load more content proactively
          >
            <FeedContent
              feedItems={displayedItems}
              likedItems={likedItems}
              isSubscribed={true}
              onLike={onLike}
              onContact={onContact}
              onRefresh={onRefresh}
              engagementTracker={engagementTracker}
            />
            
            {/* Dynamic flow indicators */}
            <div className="text-center py-6">
              <div className="text-gray-400 text-sm space-y-1">
                <div>Dynamic Feed Active • Content Pool: {feedEngineStats.poolSize}</div>
                <div>Rotation Cycle: {feedEngineStats.rotationCycle} • Fresh Content Available</div>
                <div className="text-xs text-gray-500">Continuous flow ensures you never run out of content</div>
              </div>
            </div>
          </InfiniteScroll>
        </PullToRefresh>
      </div>
    </div>
  );
};

export default InstagramFeed;
