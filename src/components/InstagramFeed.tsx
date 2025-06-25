
import React, { useState, useCallback } from 'react';
import FeedHeader from './feed/FeedHeader';
import FeedContent from './feed/FeedContent';
import PullToRefresh from './feed/PullToRefresh';
import InfiniteScroll from './feed/InfiniteScroll';
import { useContinuousFeedData } from '@/hooks/useContinuousFeedData';
import { toast } from '@/hooks/use-toast';

interface InstagramFeedProps {
  onLike: (itemId: string, profileId: string) => void;
  onContact: (profile: any) => void;
  onRefresh: () => void;
  likedItems: Set<string>;
}

const InstagramFeed = ({ onLike, onContact, onRefresh, likedItems }: InstagramFeedProps) => {
  const [showFilters, setShowFilters] = useState(false);
  
  // Use new continuous feed system
  const {
    displayedItems,
    hasMoreItems,
    isLoadingMore,
    handleLoadMore,
    handleRefresh,
    engagementTracker,
    feedStats
  } = useContinuousFeedData();

  const handlePullRefresh = useCallback(async () => {
    handleRefresh();
    await new Promise(resolve => setTimeout(resolve, 1000));
    onRefresh();
  }, [handleRefresh, onRefresh]);

  const handleSmartRefresh = useCallback(() => {
    console.log('🌊 Smart continuous feed refresh triggered');
    handleRefresh();
    onRefresh();
    toast({
      title: "Continuous feed refreshed",
      description: `Fresh content loaded! ${feedStats.totalAvailable} items available`,
    });
  }, [handleRefresh, onRefresh, feedStats.totalAvailable]);

  console.log('🌊 InstagramFeed rendering with continuous system:', {
    displayedItems: displayedItems.length,
    hasMore: hasMoreItems,
    isLoading: isLoadingMore,
    stats: feedStats
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
            threshold={300} // Load more content earlier
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
            
            {/* Continuous flow indicator */}
            {hasMoreItems && !isLoadingMore && (
              <div className="text-center py-4">
                <div className="text-gray-400 text-sm">
                  {feedStats.totalAvailable - displayedItems.length} more items available
                </div>
              </div>
            )}
          </InfiniteScroll>
        </PullToRefresh>
      </div>
    </div>
  );
};

export default InstagramFeed;
