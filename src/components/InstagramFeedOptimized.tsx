
import React, { useState, useCallback, memo } from 'react';
import FeedHeader from './feed/FeedHeader';
import OptimizedFeedContent from './feed/OptimizedFeedContent';
import PullToRefresh from './feed/PullToRefresh';
import SmartFeedIndicator from './feed/SmartFeedIndicator';
import PWAInstallPrompt from './common/PWAInstallPrompt';
import OfflineBanner from './common/OfflineBanner';
import LoadingSpinner from './common/LoadingSpinner';
import { useOptimizedFeed } from '@/hooks/useOptimizedFeed';
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
  
  // Use optimized feed hook
  const { 
    feedItems, 
    isLoading, 
    hasMore, 
    loadMore, 
    refresh, 
    totalItems 
  } = useOptimizedFeed({
    pageSize: 20,
    enableRealTime: true,
    cacheTime: 300000
  });

  // Initialize performance optimizations
  usePerformanceOptimizations();

  const handlePullRefresh = useCallback(async () => {
    console.log('🔄 Pull refresh triggered');
    
    try {
      refresh();
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

  console.log('🚀 OptimizedFeed render:', {
    totalItems,
    isLoading,
    hasMore
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
      
      {/* Smart Feed Indicator */}
      <SmartFeedIndicator
        queueCount={0}
        onRefresh={handlePullRefresh}
      />
      
      <div className="max-w-md mx-auto">
        <PullToRefresh onRefresh={handlePullRefresh} className="pt-32">
          <OptimizedFeedContent
            feedItems={feedItems}
            likedItems={likedItems}
            isSubscribed={true}
            onLike={onLike}
            onContact={onContact}
            hasMore={hasMore}
            loadMore={loadMore}
            isLoading={isLoading}
          />
          
          <div className="text-center py-6">
            <div className="text-gray-400 text-sm space-y-1">
              <div className="flex items-center justify-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span>Optimized Feed Active</span>
              </div>
              <div>Content: {totalItems}</div>
              <div className="text-xs text-gray-500">
                High performance • PWA ready • Offline capable
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
