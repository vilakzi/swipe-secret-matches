
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
  
  // Universal feed engine ensuring ALL content reaches ALL users
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
    console.log('🔄 PULL REFRESH: Distributing ALL content to ALL users');
    handleRefresh();
    await new Promise(resolve => setTimeout(resolve, 1000));
    onRefresh();
    
    toast({
      title: "Fresh content distributed!",
      description: `All ${feedEngineStats.totalCount} items distributed universally - ${feedEngineStats.unusedContentCount} unused`,
    });
  }, [handleRefresh, onRefresh, feedEngineStats]);

  const handleSmartRefresh = useCallback(() => {
    console.log('🔄 SMART REFRESH: Universal content distribution active');
    handleRefresh();
    onRefresh();
    toast({
      title: "Universal distribution complete!",
      description: `${feedEngineStats.distributedContent}/${feedEngineStats.totalCount} items distributed (${Math.round((feedEngineStats.distributionEfficiency || 1) * 100)}% efficiency)`,
    });
  }, [handleRefresh, onRefresh, feedEngineStats]);

  console.log('🚀 InstagramFeed: Universal content distribution active:', {
    displayedItems: displayedItems.length,
    totalContent: feedEngineStats.totalCount,
    distributedContent: feedEngineStats.distributedContent,
    unusedContent: feedEngineStats.unusedContentCount,
    distributionEfficiency: Math.round((feedEngineStats.distributionEfficiency || 1) * 100),
    activeUsers: feedEngineStats.activeUsers
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
            
            {/* Universal distribution status */}
            <div className="text-center py-6">
              <div className="text-gray-400 text-sm space-y-1">
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span>Universal Distribution Active</span>
                </div>
                <div>Content Pool: {feedEngineStats.totalCount} • Distributed: {feedEngineStats.distributedContent}</div>
                <div className="text-green-400 font-semibold">
                  Unused Content: {feedEngineStats.unusedContentCount} • Efficiency: {Math.round((feedEngineStats.distributionEfficiency || 1) * 100)}%
                </div>
                <div>Active Users: {feedEngineStats.activeUsers} • Real-time Sync</div>
                <div className="text-xs text-gray-500">
                  Zero waste • Universal reach • Real-time distribution
                </div>
              </div>
            </div>
          </InfiniteScroll>
        </PullToRefresh>
      </div>

      {/* Faster refresh for universal distribution */}
      <RefreshManager
        onRefresh={handleSmartRefresh}
        autoRefreshInterval={90000} // 1.5 minutes for universal sync
      />
    </div>
  );
};

export default InstagramFeed;
