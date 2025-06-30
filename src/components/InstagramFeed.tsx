
import React, { useState, useCallback } from 'react';
import FeedHeader from './feed/FeedHeader';
import FeedContent from './feed/FeedContent';
import PullToRefresh from './feed/PullToRefresh';
import InfiniteScroll from './feed/InfiniteScroll';
import RefreshManager from './feed/RefreshManager';
import LoadingSpinner from './common/LoadingSpinner';
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
  
  // Initialize feed engine with error handling
  const feedEngine = useSimplifiedFeedEngine();
  
  const {
    displayedItems,
    hasMoreItems,
    isLoadingMore,
    handleLoadMore,
    handleRefresh,
    engagementTracker,
    feedEngineStats
  } = feedEngine || {};

  const handlePullRefresh = useCallback(async () => {
    console.log('🔄 Pull refresh triggered');
    
    try {
      if (handleRefresh) {
        handleRefresh();
      }
      await new Promise(resolve => setTimeout(resolve, 1000));
      onRefresh();
      
      toast({
        title: "Feed refreshed!",
        description: "Latest content loaded successfully",
      });
    } catch (error) {
      console.error('Pull refresh error:', error);
      toast({
        title: "Refresh failed",
        description: "Please try again",
        variant: "destructive"
      });
    }
  }, [handleRefresh, onRefresh]);

  const handleSmartRefresh = useCallback(() => {
    console.log('🔄 Smart refresh triggered');
    
    try {
      if (handleRefresh) {
        handleRefresh();
      }
      onRefresh();
      
      toast({
        title: "Content updated!",
        description: "Fresh content distributed",
      });
    } catch (error) {
      console.error('Smart refresh error:', error);
    }
  }, [handleRefresh, onRefresh]);

  console.log('🚀 InstagramFeed status:', {
    displayedItems: displayedItems?.length || 0,
    hasMoreItems: hasMoreItems || false,
    isLoadingMore: isLoadingMore || false,
    totalContent: feedEngineStats?.totalCount || 0
  });

  // Show loading spinner when no items are loaded yet
  if (feedEngineStats?.loadingState === 'loading' && (!displayedItems || displayedItems.length === 0)) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-purple-900">
        <FeedHeader
          showFilters={showFilters}
          setShowFilters={setShowFilters}
          onImageUpload={() => console.log('Image upload initiated')}
          onVideoUpload={() => console.log('Video upload initiated')}
          onRefresh={handleSmartRefresh}
        />
        
        <div className="pt-32 flex justify-center items-center min-h-[400px]">
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
        <PullToRefresh onRefresh={handlePullRefresh} className="pt-20">
          <InfiniteScroll
            hasMore={hasMoreItems || false}
            isLoading={isLoadingMore || false}
            onLoadMore={handleLoadMore}
            threshold={200}
          >
            <FeedContent
              feedItems={displayedItems || []}
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
                <div>Total Content: {feedEngineStats?.totalCount || 0}</div>
                <div>Displayed: {feedEngineStats?.distributedContent || 0}</div>
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
