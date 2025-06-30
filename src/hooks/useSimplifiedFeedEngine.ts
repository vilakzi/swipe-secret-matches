
import { useState, useCallback, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRealProfiles } from './useRealProfiles';
import { useNewJoiners } from './useNewJoiners';
import { usePostFetching } from './feed/usePostFetching';
import { useFeedItemCreation } from './feed/useFeedItemCreation';
import { useEngagementTracking } from './feed/useEngagementTracking';
import { useRealTimeFeed } from './useRealTimeFeed';

export const useSimplifiedFeedEngine = () => {
  const { user } = useAuth() || {};
  const [shuffleKey, setShuffleKey] = useState(() => Date.now());
  const [displayedItems, setDisplayedItems] = useState([]);
  const [hasMoreItems, setHasMoreItems] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  // Fetch data sources
  const { realProfiles, loading: profilesLoading } = useRealProfiles();
  const { newJoiners, loading: newJoinersLoading } = useNewJoiners();
  const { posts, refetchPosts } = usePostFetching();

  // Create feed items
  const rawFeedItems = useFeedItemCreation({
    filteredProfiles: realProfiles || [],
    posts: posts || [],
    shuffleKey,
    userId: user?.id
  });

  // Update displayed items when raw items change
  useEffect(() => {
    if (rawFeedItems && rawFeedItems.length > 0) {
      setDisplayedItems(rawFeedItems.slice(0, 30));
      setHasMoreItems(rawFeedItems.length > 30);
    }
  }, [rawFeedItems]);

  // Load more items
  const handleLoadMore = useCallback(() => {
    if (!rawFeedItems || isLoadingMore) return;
    
    setIsLoadingMore(true);
    
    setTimeout(() => {
      const currentLength = displayedItems.length;
      const nextItems = rawFeedItems.slice(currentLength, currentLength + 20);
      
      if (nextItems.length > 0) {
        setDisplayedItems(prev => [...prev, ...nextItems]);
      }
      
      setHasMoreItems(currentLength + nextItems.length < rawFeedItems.length);
      setIsLoadingMore(false);
    }, 500);
  }, [rawFeedItems, displayedItems.length, isLoadingMore]);

  // Refresh handler
  const handleRefresh = useCallback(() => {
    setShuffleKey(Date.now());
    setDisplayedItems([]);
    setHasMoreItems(true);
    
    if (refetchPosts) {
      refetchPosts();
    }
  }, [refetchPosts]);

  // Real-time updates
  useRealTimeFeed({
    onNewPost: handleRefresh,
    onPostUpdate: handleRefresh,
    onPostDelete: handleRefresh,
    onNewProfile: handleRefresh
  });

  // Engagement tracking
  const engagementTracker = useEngagementTracking();

  const isLoading = profilesLoading || newJoinersLoading;

  return {
    displayedItems,
    hasMoreItems,
    isLoadingMore: isLoading || isLoadingMore,
    handleLoadMore,
    handleRefresh,
    engagementTracker,
    feedEngineStats: {
      totalCount: rawFeedItems?.length || 0,
      distributedContent: displayedItems.length,
      unusedContentCount: Math.max(0, (rawFeedItems?.length || 0) - displayedItems.length),
      activeUsers: 1,
      distributionEfficiency: 1
    }
  };
};
