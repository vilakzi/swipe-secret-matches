
import { useState, useCallback, useEffect, useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRealProfiles } from './useRealProfiles';
import { useNewJoiners } from './useNewJoiners';
import { usePostFetching } from './feed/usePostFetching';
import { useFeedItemCreation } from './feed/useFeedItemCreation';
import { useEngagementTracking } from './feed/useEngagementTracking';
import { useRealTimeFeed } from './useRealTimeFeed';

export const useSimplifiedFeedEngine = () => {
  // CRITICAL: ALL HOOKS MUST BE CALLED IN EXACT SAME ORDER EVERY TIME
  const { user } = useAuth();
  const [shuffleKey, setShuffleKey] = useState(Date.now());
  const [displayedItems, setDisplayedItems] = useState([]);
  const [hasMoreItems, setHasMoreItems] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  // ALL data fetching hooks - MUST be called unconditionally
  const engagementTracker = useEngagementTracking();
  const realProfilesResult = useRealProfiles();
  const newJoinersResult = useNewJoiners();
  const postFetchingResult = usePostFetching();

  // Extract data with safe fallbacks
  const realProfiles = realProfilesResult?.realProfiles || [];
  const profilesLoading = realProfilesResult?.loading || false;
  const newJoiners = newJoinersResult?.newJoiners || [];
  const newJoinersLoading = newJoinersResult?.loading || false;
  const posts = postFetchingResult?.posts || [];
  const refetchPosts = postFetchingResult?.refetchPosts;

  // Create feed items with completely stable dependencies
  const rawFeedItems = useMemo(() => {
    console.log('🚀 Creating feed items with stable dependencies');
    
    if (!realProfiles || !posts) {
      console.log('⏳ Waiting for data...');
      return [];
    }
    
    try {
      return useFeedItemCreation({
        filteredProfiles: realProfiles,
        posts: posts,
        shuffleKey,
        userId: user?.id || null
      });
    } catch (error) {
      console.error('Feed creation error:', error);
      return [];
    }
  }, [realProfiles, posts, shuffleKey, user?.id]);

  // Update displayed items when raw items change - STABLE DEPENDENCY
  useEffect(() => {
    if (Array.isArray(rawFeedItems) && rawFeedItems.length > 0) {
      const initialItems = rawFeedItems.slice(0, 30);
      setDisplayedItems(initialItems);
      setHasMoreItems(rawFeedItems.length > 30);
      console.log('🚀 Feed loaded:', initialItems.length, 'items');
    } else {
      setDisplayedItems([]);
      setHasMoreItems(false);
      console.log('🚀 No feed items available');
    }
  }, [rawFeedItems]);

  // Stable load more handler
  const handleLoadMore = useCallback(() => {
    if (!Array.isArray(rawFeedItems) || isLoadingMore || !hasMoreItems) {
      return;
    }
    
    console.log('🚀 Loading more items...');
    setIsLoadingMore(true);
    
    setTimeout(() => {
      try {
        const currentLength = displayedItems.length;
        const nextItems = rawFeedItems.slice(currentLength, currentLength + 20);
        
        if (nextItems.length > 0) {
          setDisplayedItems(prev => [...prev, ...nextItems]);
          console.log('🚀 Loaded', nextItems.length, 'more items');
        }
        
        setHasMoreItems(currentLength + nextItems.length < rawFeedItems.length);
      } catch (error) {
        console.error('Load more error:', error);
      } finally {
        setIsLoadingMore(false);
      }
    }, 300);
  }, [rawFeedItems, displayedItems.length, isLoadingMore, hasMoreItems]);

  // Stable refresh handler
  const handleRefresh = useCallback(() => {
    console.log('🚀 Refreshing feed');
    
    try {
      setShuffleKey(Date.now());
      setDisplayedItems([]);
      setHasMoreItems(true);
      setIsLoadingMore(false);
      
      if (typeof refetchPosts === 'function') {
        refetchPosts();
      }
    } catch (error) {
      console.error('Refresh error:', error);
    }
  }, [refetchPosts]);

  // Real-time handlers with stable dependencies
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

  // Real-time feed - MUST be called unconditionally
  useRealTimeFeed({
    onNewPost: handleNewPost,
    onPostUpdate: handlePostUpdate,
    onPostDelete: handlePostDelete,
    onNewProfile: handleNewProfile
  });

  // Calculate loading state
  const isLoading = profilesLoading || newJoinersLoading;

  // Feed statistics with stable computation
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

  // ALWAYS return exactly the same object structure
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
