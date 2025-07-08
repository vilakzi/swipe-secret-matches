
import { useState, useCallback, useEffect, useMemo } from 'react';
import { useEnhancedAuth } from '@/contexts/EnhancedAuthContext';
import { useRealProfiles } from './useRealProfiles';
import { useNewJoiners } from './useNewJoiners';
import { usePostFetching } from './feed/usePostFetching';
import { useFeedItemCreation } from './feed/useFeedItemCreation';
import { useEngagementTracking } from './feed/useEngagementTracking';
import { useRealTimeFeed } from './useRealTimeFeed';

export const useSimplifiedFeedEngine = () => {
  const { user } = useEnhancedAuth();
  const [shuffleKey, setShuffleKey] = useState(Date.now());
  const [displayedItems, setDisplayedItems] = useState([]);
  const [hasMoreItems, setHasMoreItems] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  // Initialize engagement tracker
  const engagementTracker = useEngagementTracking();

  // Fetch data with safe defaults
  const realProfilesResult = useRealProfiles();
  const newJoinersResult = useNewJoiners();
  const postFetchingResult = usePostFetching();

  // Safe data extraction with guaranteed arrays
  const realProfiles = realProfilesResult?.realProfiles || [];
  const profilesLoading = realProfilesResult?.loading || false;
  const newJoiners = newJoinersResult?.newJoiners || [];
  const newJoinersLoading = newJoinersResult?.loading || false;
  const posts = postFetchingResult?.posts || [];
  const refetchPosts = postFetchingResult?.refetchPosts || (() => {});

  // Create feed items with the hook called properly at top level
  const rawFeedItems = useFeedItemCreation({
    filteredProfiles: realProfiles,
    posts: posts,
    shuffleKey,
    userId: user?.id || null
  });

  // Update displayed items when raw items change
  useEffect(() => {
    console.log('🚀 Raw feed items updated:', rawFeedItems?.length || 0);
    
    if (rawFeedItems && rawFeedItems.length > 0) {
      const initialItems = rawFeedItems.slice(0, 30);
      setDisplayedItems(initialItems);
      setHasMoreItems(rawFeedItems.length > 30);
      console.log('🚀 Feed items set:', initialItems.length);
    } else {
      // Set empty arrays instead of null/undefined
      setDisplayedItems([]);
      setHasMoreItems(false);
    }
  }, [rawFeedItems]);

  // Load more handler with better error handling
  const handleLoadMore = useCallback(() => {
    if (!rawFeedItems || isLoadingMore || !hasMoreItems) {
      return;
    }
    
    console.log('🚀 Loading more items...');
    setIsLoadingMore(true);
    
    setTimeout(() => {
      const currentLength = displayedItems.length;
      const nextItems = rawFeedItems.slice(currentLength, currentLength + 20);
      
      if (nextItems.length > 0) {
        setDisplayedItems(prev => [...prev, ...nextItems]);
        console.log('🚀 Loaded', nextItems.length, 'more items');
      }
      
      setHasMoreItems(currentLength + nextItems.length < rawFeedItems.length);
      setIsLoadingMore(false);
    }, 300);
  }, [rawFeedItems, displayedItems.length, isLoadingMore, hasMoreItems]);

  // Refresh handler
  const handleRefresh = useCallback(() => {
    console.log('🚀 Refreshing feed');
    
    setShuffleKey(Date.now());
    setDisplayedItems([]);
    setHasMoreItems(false);
    setIsLoadingMore(false);
    
    if (refetchPosts) {
      refetchPosts();
    }
  }, [refetchPosts]);

  // Real-time handlers
  const handleNewPost = useCallback(() => {
    console.log('📡 New post - refreshing');
    handleRefresh();
  }, [handleRefresh]);

  const handlePostUpdate = useCallback(() => {
    console.log('📡 Post updated - refreshing');
    handleRefresh();
  }, [handleRefresh]);

  const handlePostDelete = useCallback(() => {
    console.log('📡 Post deleted - refreshing');
    handleRefresh();
  }, [handleRefresh]);

  const handleNewProfile = useCallback(() => {
    console.log('📡 New profile - refreshing');
    handleRefresh();
  }, [handleRefresh]);

  // Real-time feed subscription
  useRealTimeFeed({
    onNewPost: handleNewPost,
    onPostUpdate: handlePostUpdate,
    onPostDelete: handlePostDelete,
    onNewProfile: handleNewProfile
  });

  // Calculate loading state
  const isLoading = profilesLoading || newJoinersLoading;

  // Feed statistics with safe calculations
  const feedEngineStats = useMemo(() => {
    const totalCount = Array.isArray(rawFeedItems) ? rawFeedItems.length : 0;
    const distributedContent = Array.isArray(displayedItems) ? displayedItems.length : 0;
    
    return {
      totalCount,
      distributedContent,
      unusedContentCount: Math.max(0, totalCount - distributedContent),
      activeUsers: 1,
      distributionEfficiency: totalCount > 0 ? (distributedContent / totalCount) : 0,
      loadingState: isLoading ? 'loading' : 'ready'
    };
  }, [rawFeedItems, displayedItems, isLoading]);

  console.log('🚀 Feed Engine Stats:', feedEngineStats);

  // Always return consistent object structure with guaranteed arrays
  return {
    displayedItems: Array.isArray(displayedItems) ? displayedItems : [],
    hasMoreItems: Boolean(hasMoreItems),
    isLoadingMore: Boolean(isLoadingMore),
    handleLoadMore,
    handleRefresh,
    engagementTracker: engagementTracker || {},
    feedEngineStats
  };
};
