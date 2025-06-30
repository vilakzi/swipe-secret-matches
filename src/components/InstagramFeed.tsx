
import React, { useState, useCallback, memo } from 'react';
import FeedHeader from './feed/FeedHeader';
import FeedContent from './feed/FeedContent';
import PullToRefresh from './feed/PullToRefresh';
import InfiniteScroll from './feed/InfiniteScroll';
import RefreshManager from './feed/RefreshManager';
import LoadingSpinner from './common/LoadingSpinner';
import { useSimplifiedFeedEngine } from '@/hooks/useSimplifiedFeedEngine';
import { usePerformanceMonitor } from '@/hooks/usePerformanceMonitor';
import { toast } from '@/hooks/use-toast';

interface InstagramFeedProps {
  onLike: (itemId: string, profileId: string) => void;
  onContact: (profile: any) => void;
  onRefresh: () => void;
  likedItems: Set<string>;
}

const InstagramFeed = memo(({ onLike, onContact, onRefresh, likedItems }: InstagramFeedProps) => {
  const [showFilters, setShowFilters] = useState(false);
  
  // ALL HOOKS MUST BE CALLED AT THE TOP LEVEL
  const { logError } = usePerformanceMonitor('InstagramFeed');
  const feedEngine = useSimplifiedFeedEngine();
  
  // Safe destructuring with guaranteed fallbacks
  const displayedItems = feedEngine?.displayedItems || [];
  const hasMoreItems = feedEngine?.hasMoreItems || false;
  const isLoadingMore = feedEngine?.isLoadingMore || false;
  const handleLoadMore = feedEngine?.handleLoadMore || (() => {});
  const handleRefresh = feedEngine?.handleRefresh || (() => {});
  const engagementTracker = feedEngine?.engagementTracker || {};
  const feedEngineStats = feedEngine?.feedEngineStats || {
    totalCount: 0,
    distributedContent: 0,
    loadingState: 'loading'
  };

  const handlePullRefresh = useCallback(async () => {
    console.log('🔄 Pull refresh triggered');
    
    try {
      handleRefresh();
      await new Promise(resolve => setTimeout(resolve, 1000));
      onRefresh();
      
      toast({
        title: "Feed refreshed!",
        description: "Latest content loaded successfully",
      });
    } catch (error) {
      console.error('Pull refresh error:', error);
      logError(error as Error);
      toast({
        title: "Refresh failed",
        description: "Please try again",
        variant: "destructive"
      });
    }
  }, [handleRefresh, onRefresh, logError]);

  const handleSmartRefresh = useCallback(() => {
    console.log('🔄 Smart refresh triggered');
    
    try {
      handleRefresh();
      onRefresh();
      
      toast({
        title: "Content updated!",
        description: "Fresh content distributed",
      });
    } catch (error) {
      console.error('Smart refresh error:', error);
      logError(error as Error);
    }
  }, [handleRefresh, onRefresh, logError]);

  console.log('🚀 InstagramFeed render:', {
    displayedItems: displayedItems.length,
    hasMoreItems,
    isLoadingMore,
    totalContent: feedEngineStats.totalCount,
    loadingState: feedEngineStats.loadingState
  });

  // NOW WE CAN HAVE CONDITIONAL RENDERING
  // Show loading spinner when loading and no items
  if (feedEngineStats.loadingState === 'loading' && displayedItems.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-purple-900">
        <FeedHeader
          showFilters={showFilters}
          setShowFilters={setShowFilters}
          onImageUpload={() => console.log('Image upload initiated')}
          onVideoUpload={() => console.log('Video upload initiated')}
          onRefresh={handleSmartRefresh}
        />
        
        <div className="pt-44 flex justify-center items-center min-h-[400px]">
          <LoadingSpinner size="lg" text="Loading your feed..." />
        </div>
      </div>
    );
  }

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
        <PullToRefresh onRefresh={handlePullRefresh} className="pt-32">
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
});

InstagramFeed.displayName = 'InstagramFeed';

export default InstagramFeed;
