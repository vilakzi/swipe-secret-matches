
// --- Imports must come first --- //
import { useState, useMemo, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRealProfiles } from './useRealProfiles';
import { useNewJoiners } from './useNewJoiners';
import { useFilteredFeedData } from './useFilteredFeedData';
import { useFeedPagination } from './useFeedPagination';
import { usePostFetching } from './feed/usePostFetching';
import { useFeedItemCreation } from './feed/useFeedItemCreation';
import { useDynamicFeedAlgorithm } from './feed/useDynamicFeedAlgorithm';
import { useEngagementTracking } from './feed/useEngagementTracking';
import { FeedItem } from '@/components/feed/types/feedTypes';

export type { FeedItem };

export const useFeedData = (itemsPerPage: number = 8) => {
  // ---- User detection must be at the top of the hook, before any other hooks ---- //
  const { user } = useAuth() || {};

  // Debug: output user value before any use
  console.debug("user value is", user);

  // --- Return default values if no user (instead of null) --- //
  if (!user) {
    return {
      displayedItems: [],
      hasMoreItems: false,
      isLoadingMore: false,
      handleLoadMore: () => {},
      handleRefresh: () => {},
      engagementTracker: null
    };
  }

  // --- Now, normal hooks usage --- //
  const [shuffleKey, setShuffleKey] = useState(0);

  const { realProfiles, loading: profilesLoading } = useRealProfiles();
  const { newJoiners, loading: newJoinersLoading } = useNewJoiners();
  const { posts, refetchPosts } = usePostFetching();

  // Engagement tracking
  const engagementTracker = useEngagementTracking();

  const allProfiles = useMemo(() => {
    console.log(`Total profiles: ${realProfiles.length} (all real accounts)`);
    return realProfiles;
  }, [realProfiles]);

  // Apply role-based filtering with posts data
  const roleFilteredProfiles = useFilteredFeedData(allProfiles, newJoiners, posts);

  // All profiles are used; no further filtering
  const filteredProfiles = roleFilteredProfiles;

  // Create all feed items with fixed duplication algorithm
  const rawFeedItems = useFeedItemCreation({
    filteredProfiles,
    posts,
    shuffleKey,
    userId: user?.id
  });

  // Apply dynamic algorithm for intelligent content ranking
  const {
    algorithmicFeed,
    isProcessing: algorithmProcessing,
    manualRefresh: refreshAlgorithm,
    refreshCount
  } = useDynamicFeedAlgorithm({
    rawFeedItems,
    enabled: true,
    autoRefreshInterval: 180000, // 3 minutes
    maxItemsPerLoad: itemsPerPage * 3 // Give algorithm more items to work with
  });

  // Handle pagination with algorithmic feed
  const {
    displayedItems,
    hasMoreItems,
    isLoadingMore: paginationLoading,
    handleLoadMore,
    resetPagination
  } = useFeedPagination(algorithmicFeed, itemsPerPage);

  const isLoadingMore = paginationLoading || profilesLoading || newJoinersLoading || algorithmProcessing;

  // Enhanced refresh with algorithm reset
  const handleRefresh = useCallback(() => {
    console.log('🔄 Refreshing feed with dynamic algorithm (refresh #' + (refreshCount + 1) + ')');
    resetPagination();
    refetchPosts();
    
    // Generate new shuffle key for fresh algorithm results
    setShuffleKey(prev => prev + Math.floor(Math.random() * 1000));
    
    // Trigger algorithm refresh
    refreshAlgorithm();
    
    // Clear old engagement data
    engagementTracker.clearOldEngagementData();
  }, [resetPagination, refetchPosts, refreshAlgorithm, engagementTracker, refreshCount]);

  return {
    displayedItems,
    hasMoreItems,
    isLoadingMore,
    handleLoadMore,
    handleRefresh,
    engagementTracker
  };
};
