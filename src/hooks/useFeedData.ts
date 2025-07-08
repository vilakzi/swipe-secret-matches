
import { useState, useMemo, useCallback } from 'react';
import { useEnhancedAuth } from '@/contexts/EnhancedAuthContext';
import { useRealProfiles } from './useRealProfiles';
import { useNewJoiners } from './useNewJoiners';
import { useFilteredFeedData } from './useFilteredFeedData';
import { useFeedPagination } from './useFeedPagination';
import { usePostFetching } from './feed/usePostFetching';
import { useFeedItemCreation } from './feed/useFeedItemCreation';
import { useEngagementTracking } from './feed/useEngagementTracking';
import { FeedItem } from '@/components/feed/types/feedTypes';

export type { FeedItem };

export const useFeedData = (itemsPerPage: number = 8) => {
  const { user } = useEnhancedAuth() || {};
  const [shuffleKey, setShuffleKey] = useState(0);

  console.log("📱 useFeedData - user:", user?.id || 'no user');

  const { realProfiles, loading: profilesLoading } = useRealProfiles();
  const { newJoiners, loading: newJoinersLoading } = useNewJoiners();
  const { posts, refetchPosts } = usePostFetching();

  // Safe engagement tracking
  const engagementTracker = useEngagementTracking();

  const allProfiles = useMemo(() => {
    if (!realProfiles) return [];
    console.log(`📱 Total profiles: ${realProfiles.length}`);
    return realProfiles;
  }, [realProfiles]);

  // Apply filtering
  const filteredProfiles = useFilteredFeedData(allProfiles, newJoiners || [], posts || []);

  // Create feed items
  const rawFeedItems = useFeedItemCreation({
    filteredProfiles: filteredProfiles || [],
    posts: posts || [],
    shuffleKey,
    userId: user?.id
  });

  // Handle pagination
  const {
    displayedItems,
    hasMoreItems,
    isLoadingMore: paginationLoading,
    handleLoadMore,
    resetPagination
  } = useFeedPagination(rawFeedItems || [], itemsPerPage);

  const isLoadingMore = paginationLoading || profilesLoading || newJoinersLoading;

  // Simplified refresh
  const handleRefresh = useCallback(() => {
    console.log('📱 Refreshing feed');
    resetPagination();
    
    if (refetchPosts) {
      refetchPosts();
    }
    
    setShuffleKey(prev => prev + 1);
  }, [resetPagination, refetchPosts]);

  return {
    displayedItems: displayedItems || [],
    hasMoreItems: hasMoreItems || false,
    isLoadingMore,
    handleLoadMore,
    handleRefresh,
    engagementTracker
  };
};
