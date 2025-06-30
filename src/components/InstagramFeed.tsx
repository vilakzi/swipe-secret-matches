
import React, { useState, useCallback } from 'react';
import FeedHeader from './feed/FeedHeader';
import FeedContent from './feed/FeedContent';
import PullToRefresh from './feed/PullToRefresh';
import InfiniteScroll from './feed/InfiniteScroll';
import RefreshManager from './feed/RefreshManager';
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
  
  // Use dynamic feed engine for continuous, fresh content
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
    console.log('🔄 Pull refresh - generating completely fresh content');
    handleRefresh();
    await new Promise(resolve => setTimeout(resolve, 1000));
    onRefresh();
    
    toast({
      title: "Fresh content loaded!",
      description: "Your feed has been completely refreshed with new content",
    });
  }, [handleRefresh, onRefresh]);

  const handleSmartRefresh = useCallback(() => {
    console.log('🔄 Smart refresh - ensuring fresh content rotation');
    handleRefresh();
    onRefresh();
    toast({
      title: "Fresh content loaded!",
      description: `Feed refreshed with ${feedEngineStats.totalCount} items rotating (${Math.round(feedEngineStats.freshContentRatio * 100)}% fresh)`,
    });
  }, [handleRefresh, onRefresh, feedEngineStats]);

  console.log('🚀 InstagramFeed rendering with fresh content engine:', {
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
            threshold={200}
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
            
            {/* Fresh content indicators */}
            <div className="text-center py-6">
              <div className="text-gray-400 text-sm space-y-1">
                <div>Fresh Feed Active • Content Pool: {feedEngineStats.totalCount}</div>
                <div>Fresh Content: {Math.round(feedEngineStats.freshContentRatio * 100)}% • Real-time Updates</div>
                <div className="text-xs text-gray-500">
                  Auto-refresh • Content rotation • Never the same twice
                </div>
              </div>
            </div>
          </InfiniteScroll>
        </PullToRefresh>
      </div>

      {/* Smart refresh manager with shorter intervals for fresh content */}
      <RefreshManager
        onRefresh={handleSmartRefresh}
        autoRefreshInterval={120000} // 2 minutes for fresh content
      />
    </div>
  );
};

export default InstagramFeed;
