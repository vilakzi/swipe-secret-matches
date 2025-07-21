
import React, { useState, useCallback, memo } from 'react';
import FeedHeader from './feed/FeedHeader';
import StableFeedContent from './feed/StableFeedContent';
import PullToRefresh from './feed/PullToRefresh';
import UpdateIndicator from './feed/UpdateIndicator';
import PWAInstallPrompt from './common/PWAInstallPrompt';
import OfflineBanner from './common/OfflineBanner';
import LoadingSpinner from './common/LoadingSpinner';
import { useStableFeed } from '@/hooks/useStableFeed';
import { usePerformanceOptimizations } from '@/hooks/usePerformanceOptimizations';
import { toast } from '@/hooks/use-toast';

interface InstagramFeedOptimizedProps {
  onLike: (itemId: string, profileId: string) => void;
  onContact: (profile: any) => void;
  onRefresh: () => void;
  likedItems: Set<string>;
}

const InstagramFeedOptimized = memo(({ 
  onLike, 
  onContact, 
  onRefresh, 
  likedItems 
}: InstagramFeedOptimizedProps) => {
  const [showFilters, setShowFilters] = useState(false);
  
  // Use stable feed hook - user controlled updates only
  const { 
    feedItems, 
    isLoading, 
    hasMore, 
    loadMore, 
    refresh,
    handleScrollActivity,
    hasQueuedUpdates,
    updateQueueCount,
    applyQueuedUpdates,
    isUserScrolling,
    totalItems 
  } = useStableFeed({
    pageSize: 20,
    enableBackgroundUpdates: true, // Queue updates, don't apply automatically
    respectUserActivity: true // Respect when user is actively viewing
  });

  // Initialize performance optimizations
  usePerformanceOptimizations();

  const handlePullRefresh = useCallback(async () => {
    console.log('🔄 User initiated refresh');
    
    try {
      await refresh();
      onRefresh();
      
      toast({
        title: "Feed refreshed!",
        description: "Latest content loaded",
      });
    } catch (error) {
      console.error('Pull refresh error:', error);
      toast({
        title: "Refresh failed",
        description: "Please try again",
        variant: "destructive"
      });
    }
  }, [refresh, onRefresh]);

  const handleApplyUpdates = useCallback(async () => {
    console.log('🔄 User applying queued updates');
    
    try {
      await applyQueuedUpdates();
      
      toast({
        title: "Updates applied!",
        description: `${updateQueueCount} new items loaded`,
      });
    } catch (error) {
      console.error('Apply updates error:', error);
      toast({
        title: "Update failed",
        description: "Please try refreshing",
        variant: "destructive"
      });
    }
  }, [applyQueuedUpdates, updateQueueCount]);

  console.log('🚀 StableFeed render:', {
    totalItems,
    isLoading,
    hasMore,
    hasQueuedUpdates,
    updateQueueCount,
    isUserScrolling
  });

  // Show loading spinner when loading and no items
  if (isLoading && feedItems.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-purple-900">
        <FeedHeader
          showFilters={showFilters}
          setShowFilters={setShowFilters}
          onImageUpload={() => console.log('Image upload initiated')}
          onVideoUpload={() => console.log('Video upload initiated')}
          onRefresh={handlePullRefresh}
        />
        
        <div className="pt-44 flex justify-center items-center min-h-[400px]">
          <LoadingSpinner size="lg" text="Loading your optimized feed..." />
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
        onRefresh={handlePullRefresh}
      />
      
      {/* Offline banner */}
      <OfflineBanner />
      
      {/* Update indicator for queued updates */}
      <UpdateIndicator
        hasUpdates={hasQueuedUpdates}
        updateCount={updateQueueCount}
        onApplyUpdates={handleApplyUpdates}
      />
      
      <div className="max-w-md mx-auto">
        <PullToRefresh onRefresh={handlePullRefresh} className="pt-32">
          <StableFeedContent
            feedItems={feedItems}
            likedItems={likedItems}
            isSubscribed={true}
            onLike={onLike}
            onContact={onContact}
            hasMore={hasMore}
            loadMore={loadMore}
            isLoading={isLoading}
            onScrollActivity={handleScrollActivity}
          />
          
          <div className="text-center py-6">
            <div className="text-gray-400 text-sm space-y-1">
              <div className="flex items-center justify-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span>Stable Feed Active</span>
              </div>
              <div>Content: {totalItems} • {hasQueuedUpdates ? `${updateQueueCount} queued` : 'Up to date'}</div>
              <div className="text-xs text-gray-500">
                User controlled • No auto-refresh • Scroll preserved
              </div>
            </div>
          </div>
        </PullToRefresh>
      </div>

      {/* PWA Install Prompt */}
      <PWAInstallPrompt />
    </div>
  );
});

InstagramFeedOptimized.displayName = 'InstagramFeedOptimized';

export default InstagramFeedOptimized;
