
import React, { useState, useCallback } from 'react';
import FeedHeader from './feed/FeedHeader';
import FeedContent from './feed/FeedContent';
import PullToRefresh from './feed/PullToRefresh';
import InfiniteScroll from './feed/InfiniteScroll';
import RefreshManager from './feed/RefreshManager';
import { useSimplifiedFeedEngine } from '@/hooks/useSimplifiedFeedEngine';
import { toast } from '@/hooks/use-toast';

interface InstagramFeedProps {
  onLike: (itemId: string, profileId: string) => void;
  onContact: (profile: any) => void;
  onRefresh: () => void;
  likedItems: Set<string>;
}

const InstagramFeed = ({ onLike, onContact, onRefresh, likedItems }: InstagramFeedProps) => {
  const [showFilters, setShowFilters] = useState(false);
  
  const {
    displayedItems,
    hasMoreItems,
    isLoadingMore,
    handleLoadMore,
    handleRefresh,
    engagementTracker,
    feedEngineStats
  } = useSimplifiedFeedEngine();

  const handlePullRefresh = useCallback(async () => {
    console.log('🔄 Pull refresh triggered');
    handleRefresh();
    await new Promise(resolve => setTimeout(resolve, 1000));
    onRefresh();
    
    toast({
      title: "Feed refreshed!",
      description: "Latest content loaded successfully",
    });
  }, [handleRefresh, onRefresh]);

  const handleSmartRefresh = useCallback(() => {
    console.log('🔄 Smart refresh triggered');
    handleRefresh();
    onRefresh();
    
    toast({
      title: "Content updated!",
      description: "Fresh content distributed",
    });
  }, [handleRefresh, onRefresh]);

  console.log('🚀 InstagramFeed status:', {
    displayedItems: displayedItems.length,
    hasMoreItems,
    isLoadingMore,
    totalContent: feedEngineStats.totalCount
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
            
            <div className="text-center py-6">
              <div className="text-gray-400 text-sm space-y-1">
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span>Live Feed Active</span>
                </div>
                <div>Total Content: {feedEngineStats.totalCount}</div>
                <div>Displayed: {feedEngineStats.distributedContent}</div>
                <div className="text-xs text-gray-500">
                  Real-time updates • Optimized for mobile
                </div>
              </div>
            </div>
          </InfiniteScroll>
        </PullToRefresh>
      </div>

      <RefreshManager
        onRefresh={handleSmartRefresh}
        autoRefreshInterval={120000}
      />
    </div>
  );
};

export default InstagramFeed;
