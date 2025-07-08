
import { useState, useCallback } from 'react';
import { useEnhancedAuth } from '@/contexts/EnhancedAuthContext';
import { useRealProfiles } from './useRealProfiles';
import { useNewJoiners } from './useNewJoiners';
import { usePostFetching } from './feed/usePostFetching';
import { useUniversalFeedData } from './useUniversalFeedData';
import { useFeedItemCreation } from './feed/useFeedItemCreation';
import { useContinuousFeedAlgorithm } from './feed/useContinuousFeedAlgorithm';
import { useInfiniteContentFlow } from './feed/useInfiniteContentFlow';
import { useEngagementTracking } from './feed/useEngagementTracking';

export const useContinuousFeedData = () => {
  const { user } = useEnhancedAuth() || {};
  const [shuffleKey, setShuffleKey] = useState(0);

  console.log("🌊 Continuous Feed System - Active for user:", user?.id || 'no user');

  // Fetch all data sources
  const { realProfiles, loading: profilesLoading } = useRealProfiles();
  const { newJoiners, loading: newJoinersLoading } = useNewJoiners();
  const { posts, refetchPosts } = usePostFetching();

  // Universal feed data (everyone sees everyone)
  const { profiles: allProfiles, posts: allPosts } = useUniversalFeedData(realProfiles, newJoiners, posts);

  // Create feed items from all available content
  const rawFeedItems = useFeedItemCreation({
    filteredProfiles: allProfiles,
    posts: allPosts,
    shuffleKey,
    userId: user?.id
  });

  // Continuous algorithm for infinite content
  const {
    continuousContentQueue,
    markContentAsSeen,
    refreshContentPool,
    seenContentCount,
    refreshCount
  } = useContinuousFeedAlgorithm({
    rawFeedItems,
    enabled: true,
    contentPoolSize: 300, // Large pool for continuous flow
    refreshInterval: 120000, // 2 minutes
    seenContentResetTime: 1800000 // 30 minutes
  });

  // Infinite content flow
  const {
    displayedItems,
    hasMoreContent,
    isLoadingMore,
    loadMoreContent,
    resetFlow,
    totalAvailableItems
  } = useInfiniteContentFlow({
    contentQueue: continuousContentQueue,
    initialLoadSize: 15,
    loadMoreSize: 10,
    onContentSeen: markContentAsSeen
  });

  // Engagement tracking
  const engagementTracker = useEngagementTracking();

  const isLoading = profilesLoading || newJoinersLoading;

  console.log("🌊 Continuous Feed Status:", {
    displayedItems: displayedItems.length,
    totalAvailable: totalAvailableItems,
    hasMore: hasMoreContent,
    isLoading,
    seenCount: seenContentCount,
    refreshCount
  });

  // Enhanced refresh with continuous algorithm
  const handleRefresh = useCallback(() => {
    console.log('🌊 Refreshing continuous feed system');
    
    // Reset flow
    resetFlow();
    
    // Refresh data sources
    refetchPosts();
    
    // Generate new shuffle
    setShuffleKey(prev => prev + Math.floor(Math.random() * 1000));
    
    // Refresh content pool
    refreshContentPool();
    
    // Clear engagement data
    engagementTracker.clearOldEngagementData();
  }, [resetFlow, refetchPosts, refreshContentPool, engagementTracker]);

  return {
    displayedItems,
    hasMoreItems: hasMoreContent,
    isLoadingMore: isLoading || isLoadingMore,
    handleLoadMore: loadMoreContent,
    handleRefresh,
    engagementTracker,
    // Additional stats for monitoring
    feedStats: {
      totalAvailable: totalAvailableItems,
      seenCount: seenContentCount,
      refreshCount,
      profilesCount: allProfiles.length,
      postsCount: allPosts.length
    }
  };
};
