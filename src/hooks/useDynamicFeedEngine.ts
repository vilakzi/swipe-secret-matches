
import { useState, useCallback } from 'react';
import { useEnhancedAuth } from '@/contexts/EnhancedAuthContext';
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
import { useUniversalContentDistribution } from './useUniversalContentDistribution';

export const useDynamicFeedEngine = () => {
  const { user } = useEnhancedAuth() || {};
  const [shuffleKey, setShuffleKey] = useState(() => Date.now() + Math.random());
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  console.log("🚀 UNIVERSAL FEED ENGINE: Ensuring ALL content reaches ALL users");

  // Fetch all data sources
  const { realProfiles, loading: profilesLoading } = useRealProfiles();
  const { newJoiners, loading: newJoinersLoading } = useNewJoiners();
  const { posts, refetchPosts } = usePostFetching();

  // Universal content distribution system
  const { distributeContentUniversally, syncContentAcrossAllUsers, distributionStats } = useUniversalContentDistribution();

  // Universal feed data (everyone sees everything)
  const { profiles: allProfiles, posts: allPosts } = useUniversalFeedData(realProfiles, newJoiners, posts);

  // Create comprehensive feed items with universal distribution
  const rawFeedItems = useFeedItemCreation({
    filteredProfiles: allProfiles,
    posts: allPosts,
    shuffleKey: shuffleKey + refreshTrigger,
    userId: user?.id
  });

  // Distribute ALL content universally - no unused content
  const universallyDistributedItems = distributeContentUniversally(rawFeedItems);

  // Fresh feed rotation system with universal distribution
  const {
    currentBatch: rotatedFeedItems,
    generateFreshBatch,
    markAsViewed,
    resetRotation,
    viewedCount,
    totalCount
  } = useFreshFeedRotation({
    allFeedItems: universallyDistributedItems,
    batchSize: 40 // Larger batch to ensure content reaches everyone
  });

  // Advanced continuous flow with zero waste
  const {
    dynamicContentPool,
    markAsViewed: markFlowViewed,
    forceRefresh: refreshContentFlow,
    resetSession,
    sessionStats
  } = useAdvancedContinuousFlow({
    allAvailableContent: rotatedFeedItems.length > 0 ? rotatedFeedItems : universallyDistributedItems,
    contentPoolSize: 800, // Larger pool for universal distribution
    rotationInterval: 60000, // 1 minute rotation
    freshContentPercentage: 0.9 // 90% fresh content always
  });

  // Never-ending feed with universal content
  const {
    displayedItems,
    hasMoreContent,
    isLoadingMore,
    loadMoreContent,
    resetFeed,
    feedStats
  } = useNeverEndingFeed({
    dynamicContentPool,
    initialBatchSize: 30,
    loadMoreSize: 25,
    onContentViewed: (itemIds) => {
      markAsViewed(itemIds[0]);
      markFlowViewed(itemIds);
    }
  });

  // Enhanced refresh for universal distribution
  const handleUniversalRefresh = useCallback(() => {
    console.log('🚀 UNIVERSAL REFRESH: Generating completely fresh content for ALL users');
    
    // Increment refresh trigger for new content
    setRefreshTrigger(prev => prev + 1);
    
    // Reset all systems
    resetRotation();
    resetFeed();
    resetSession();
    
    // Sync across all users in real-time
    syncContentAcrossAllUsers();
    
    // Refresh data sources
    if (refetchPosts) {
      refetchPosts();
    }
    
    // Generate new shuffle key for universal freshness
    setShuffleKey(Date.now() + Math.random() * 1000);
    
    // Force content flow refresh
    refreshContentFlow();
    
    // Generate fresh batch for all users
    setTimeout(() => {
      generateFreshBatch();
    }, 100);

    console.log('🚀 UNIVERSAL REFRESH COMPLETE: Fresh content distributed to ALL users');
  }, [resetRotation, resetFeed, resetSession, syncContentAcrossAllUsers, refetchPosts, refreshContentFlow, generateFreshBatch]);

  // Real-time feed updates with universal distribution
  useRealTimeFeed({
    onNewPost: () => {
      console.log('📡 NEW POST: Distributing to ALL users immediately');
      handleUniversalRefresh();
    },
    onPostUpdate: () => {
      console.log('📡 POST UPDATE: Refreshing ALL user feeds');
      generateFreshBatch();
      refreshContentFlow();
    },
    onPostDelete: () => {
      console.log('📡 POST DELETED: Removing from ALL user feeds');
      handleUniversalRefresh();
    },
    onNewProfile: () => {
      console.log('📡 NEW PROFILE: Adding to ALL user feeds');
      handleUniversalRefresh();
    }
  });

  // Engagement tracking
  const engagementTracker = useEngagementTracking();

  const isLoading = profilesLoading || newJoinersLoading;

  console.log("🚀 UNIVERSAL FEED STATUS:", {
    displayedItems: displayedItems.length,
    poolSize: dynamicContentPool.length,
    distributionStats,
    hasMore: hasMoreContent,
    isLoading,
    viewedCount,
    totalCount: distributionStats.totalContent,
    unusedContent: distributionStats.unusedContent, // Should always be 0
    activeUsers: distributionStats.activeUsers
  });

  return {
    displayedItems,
    hasMoreItems: hasMoreContent,
    isLoadingMore: isLoading || isLoadingMore,
    handleLoadMore: loadMoreContent,
    handleRefresh: handleUniversalRefresh,
    engagementTracker,
    // Enhanced stats showing universal distribution
    feedEngineStats: {
      ...sessionStats,
      ...feedStats,
      ...distributionStats,
      totalProfiles: allProfiles.length,
      totalPosts: allPosts.length,
      allContentItems: universallyDistributedItems.length,
      viewedCount,
      totalCount: distributionStats.totalContent,
      unusedContentCount: distributionStats.unusedContent, // Always 0
      freshContentRatio: distributionStats.totalContent > 0 ? ((distributionStats.totalContent - viewedCount) / distributionStats.totalContent) : 1,
      universalDistribution: true,
      distributionEfficiency: distributionStats.totalContent > 0 ? (distributionStats.distributedContent / distributionStats.totalContent) : 1 // Should always be 1 (100%)
    }
  };
};
