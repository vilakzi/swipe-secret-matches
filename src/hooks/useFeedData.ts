
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
  const { user } = useAuth() || {};
  const [shuffleKey, setShuffleKey] = useState(0);

  console.debug("📱 useFeedData - user:", user?.id || 'no user');

  const { realProfiles, loading: profilesLoading } = useRealProfiles();
  const { newJoiners, loading: newJoinersLoading } = useNewJoiners();
  const { posts, refetchPosts } = usePostFetching();

  console.log("📱 Data status:", {
    profilesLoading,
    newJoinersLoading,
    profilesCount: realProfiles.length,
    postsCount: posts.length,
    shuffleKey,
    userExists: !!user
  });

  // Engagement tracking with error handling
  const engagementTracker = useEngagementTracking();

  const allProfiles = useMemo(() => {
    console.log(`📱 Total profiles: ${realProfiles.length} (all real accounts)`);
    return realProfiles;
  }, [realProfiles]);

  // Apply role-based filtering with posts data
  const roleFilteredProfiles = useFilteredFeedData(allProfiles, newJoiners, posts);
  const filteredProfiles = roleFilteredProfiles;

  // Create all feed items with improved error handling
  const rawFeedItems = useFeedItemCreation({
    filteredProfiles,
    posts,
    shuffleKey,
    userId: user?.id
  });

  console.log("📱 Raw feed items created:", rawFeedItems.length);

  // Apply dynamic algorithm for intelligent content ranking
  const {
    algorithmicFeed,
    isProcessing: algorithmProcessing,
    manualRefresh: refreshAlgorithm,
    refreshCount
  } = useDynamicFeedAlgorithm({
    rawFeedItems,
    enabled: true,
    autoRefreshInterval: 300000, // 5 minutes
    maxItemsPerLoad: itemsPerPage * 4
  });

  console.log("📱 Algorithmic feed processed:", {
    itemCount: algorithmicFeed.length,
    isProcessing: algorithmProcessing,
    refreshCount
  });

  // Handle pagination with algorithmic feed
  const {
    displayedItems,
    hasMoreItems,
    isLoadingMore: paginationLoading,
    handleLoadMore,
    resetPagination
  } = useFeedPagination(algorithmicFeed, itemsPerPage);

  const isLoadingMore = paginationLoading || profilesLoading || newJoinersLoading;

  console.log("📱 Final display status:", {
    displayedItemsCount: displayedItems.length,
    hasMoreItems,
    isLoadingMore
  });

  // Enhanced refresh with algorithm reset and error handling
  const handleRefresh = useCallback(() => {
    try {
      console.log('📱 Refreshing feed with dynamic algorithm (refresh #' + (refreshCount + 1) + ')');
      resetPagination();
      refetchPosts();
      
      // Generate new shuffle key for fresh algorithm results
      setShuffleKey(prev => prev + Math.floor(Math.random() * 1000));
      
      // Trigger algorithm refresh
      refreshAlgorithm();
      
      // Clear old engagement data safely
      if (engagementTracker?.clearOldEngagementData) {
        engagementTracker.clearOldEngagementData();
      }
    } catch (error) {
      console.error('Error refreshing feed:', error);
    }
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
