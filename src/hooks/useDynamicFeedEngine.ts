
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

export const useDynamicFeedEngine = () => {
  const { user } = useAuth() || {};
  const [shuffleKey, setShuffleKey] = useState(() => Date.now() + Math.random());

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
    shuffleKey,
    userId: user?.id
  });

  // Advanced continuous flow system
  const {
    dynamicContentPool,
    markAsViewed,
    forceRefresh: refreshContentFlow,
    resetSession,
    sessionStats
  } = useAdvancedContinuousFlow({
    allAvailableContent: allFeedItems,
    contentPoolSize: 600, // Large pool for variety
    rotationInterval: 90000, // 1.5 minutes
    freshContentPercentage: 0.5
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
    onContentViewed: markAsViewed
  });

  // Engagement tracking
  const engagementTracker = useEngagementTracking();

  const isLoading = profilesLoading || newJoinersLoading;

  console.log("🚀 Dynamic Feed Engine Status:", {
    displayedItems: displayedItems.length,
    poolSize: dynamicContentPool.length,
    hasMore: hasMoreContent,
    isLoading,
    session: sessionStats,
    feedStats
  });

  // Enhanced refresh that guarantees different content
  const handleDynamicRefresh = useCallback(() => {
    console.log('🚀 Dynamic refresh - ensuring completely fresh content flow');
    
    // Reset everything for maximum freshness
    resetFeed();
    resetSession();
    
    // Refresh data sources
    refetchPosts();
    
    // Generate new shuffle key for different arrangements
    setShuffleKey(Date.now() + Math.random() * 1000);
    
    // Force new content flow
    refreshContentFlow();
    
    // Clear engagement data
    engagementTracker.clearOldEngagementData();

    console.log('🚀 Dynamic refresh completed - guaranteed fresh content');
  }, [resetFeed, resetSession, refetchPosts, refreshContentFlow, engagementTracker]);

  return {
    displayedItems,
    hasMoreItems: hasMoreContent,
    isLoadingMore: isLoading || isLoadingMore,
    handleLoadMore: loadMoreContent,
    handleRefresh: handleDynamicRefresh,
    engagementTracker,
    // Enhanced stats for monitoring
    feedEngineStats: {
      ...sessionStats,
      ...feedStats,
      totalProfiles: allProfiles.length,
      totalPosts: allPosts.length,
      allContentItems: allFeedItems.length
    }
  };
};
