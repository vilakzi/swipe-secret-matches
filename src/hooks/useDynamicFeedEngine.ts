
import { useState, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRealProfiles } from './useRealProfiles';
import { useNewJoiners } from './useNewJoiners';
import { usePostFetching } from './feed/usePostFetching';
import { useUniversalFeedData } from './useUniversalFeedData';
import { useFeedItemCreation } from './feed/useFeedItemCreation';
import { useAdvancedContinuousFlow } from './feed/useAdvancedContinuousFlow';
import { useNeverEndingFeed } from './feed/useNeverEndingFeed';
import { useEngagementTracking } from './feed/useEngagementTracking';
import { useRealTimeFeed } from './useRealTimeFeed';
import { useFreshFeedRotation } from './useFreshFeedRotation';

export const useDynamicFeedEngine = () => {
  const { user } = useAuth() || {};
  const [shuffleKey, setShuffleKey] = useState(() => Date.now() + Math.random());
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  console.log("🚀 Dynamic Feed Engine - Active for user:", user?.id || 'no user');

  // Fetch all data sources
  const { realProfiles, loading: profilesLoading } = useRealProfiles();
  const { newJoiners, loading: newJoinersLoading } = useNewJoiners();
  const { posts, refetchPosts } = usePostFetching();

  // Universal feed data (everyone sees everyone)
  const { profiles: allProfiles, posts: allPosts } = useUniversalFeedData(realProfiles, newJoiners, posts);

  // Create comprehensive feed items
  const allFeedItems = useFeedItemCreation({
    filteredProfiles: allProfiles,
    posts: allPosts,
    shuffleKey: shuffleKey + refreshTrigger, // Include refresh trigger
    userId: user?.id
  });

  // Fresh feed rotation system
  const {
    currentBatch: rotatedFeedItems,
    generateFreshBatch,
    markAsViewed,
    resetRotation,
    viewedCount,
    totalCount
  } = useFreshFeedRotation({
    allFeedItems,
    batchSize: 30
  });

  // Advanced continuous flow system
  const {
    dynamicContentPool,
    markAsViewed: markFlowViewed,
    forceRefresh: refreshContentFlow,
    resetSession,
    sessionStats
  } = useAdvancedContinuousFlow({
    allAvailableContent: rotatedFeedItems.length > 0 ? rotatedFeedItems : allFeedItems,
    contentPoolSize: 600,
    rotationInterval: 90000,
    freshContentPercentage: 0.7 // Higher percentage for fresher content
  });

  // Never-ending feed implementation
  const {
    displayedItems,
    hasMoreContent,
    isLoadingMore,
    loadMoreContent,
    resetFeed,
    feedStats
  } = useNeverEndingFeed({
    dynamicContentPool,
    initialBatchSize: 25,
    loadMoreSize: 20,
    onContentViewed: (itemId) => {
      markAsViewed(itemId);
      markFlowViewed(itemId);
    }
  });

  // Enhanced refresh for complete freshness
  const handleCompleteFreshRefresh = useCallback(() => {
    console.log('🚀 Complete fresh refresh - generating entirely new content flow');
    
    // Increment refresh trigger to force new shuffle
    setRefreshTrigger(prev => prev + 1);
    
    // Reset all rotation and flow systems
    resetRotation();
    resetFeed();
    resetSession();
    
    // Refresh data sources
    if (refetchPosts) {
      refetchPosts();
    }
    
    // Generate new shuffle key
    setShuffleKey(Date.now() + Math.random() * 1000);
    
    // Force new content flow
    refreshContentFlow();
    
    // Generate fresh batch
    setTimeout(() => {
      generateFreshBatch();
    }, 100);

    console.log('🚀 Complete fresh refresh completed - guaranteed entirely fresh content');
  }, [resetRotation, resetFeed, resetSession, refetchPosts, refreshContentFlow, generateFreshBatch]);

  // Real-time feed updates
  useRealTimeFeed({
    onNewPost: handleCompleteFreshRefresh,
    onPostUpdate: () => {
      // Lighter refresh for updates
      generateFreshBatch();
      refreshContentFlow();
    },
    onPostDelete: () => {
      // Refresh to remove deleted content
      handleCompleteFreshRefresh();
    }
  });

  // Engagement tracking
  const engagementTracker = useEngagementTracking();

  const isLoading = profilesLoading || newJoinersLoading;

  console.log("🚀 Dynamic Feed Engine Status:", {
    displayedItems: displayedItems.length,
    poolSize: dynamicContentPool.length,
    hasMore: hasMoreContent,
    isLoading,
    viewedCount,
    totalCount,
    session: sessionStats,
    feedStats
  });

  return {
    displayedItems,
    hasMoreItems: hasMoreContent,
    isLoadingMore: isLoading || isLoadingMore,
    handleLoadMore: loadMoreContent,
    handleRefresh: handleCompleteFreshRefresh,
    engagementTracker,
    // Enhanced stats for monitoring
    feedEngineStats: {
      ...sessionStats,
      ...feedStats,
      totalProfiles: allProfiles.length,
      totalPosts: allPosts.length,
      allContentItems: allFeedItems.length,
      viewedCount,
      totalCount,
      freshContentRatio: totalCount > 0 ? ((totalCount - viewedCount) / totalCount) : 1
    }
  };
};
