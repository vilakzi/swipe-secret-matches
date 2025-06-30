
import { useState, useCallback, useEffect, useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRealProfiles } from './useRealProfiles';
import { useNewJoiners } from './useNewJoiners';
import { usePostFetching } from './feed/usePostFetching';
import { useFeedItemCreation } from './feed/useFeedItemCreation';
import { useEngagementTracking } from './feed/useEngagementTracking';
import { useRealTimeFeed } from './useRealTimeFeed';

export const useSimplifiedFeedEngine = () => {
  // ALL HOOKS MUST BE CALLED IN CONSISTENT ORDER - NO CONDITIONAL HOOKS
  const { user } = useAuth() || {};
  const [shuffleKey, setShuffleKey] = useState(() => Date.now());
  const [displayedItems, setDisplayedItems] = useState([]);
  const [hasMoreItems, setHasMoreItems] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  // Initialize engagement tracking with consistent hook order
  const engagementTracker = useEngagementTracking();

  // Fetch data sources - these must always be called
  const { realProfiles = [], loading: profilesLoading = false } = useRealProfiles() || {};
  const { newJoiners = [], loading: newJoinersLoading = false } = useNewJoiners() || {};
  const { posts = [], refetchPosts } = usePostFetching() || {};

  // Create feed items with stable dependencies
  const rawFeedItems = useMemo(() => {
    console.log('🚀 Creating feed items with error handling');
    
    try {
      if (!realProfiles || !posts) {
        console.log('⏳ Waiting for data to load...');
        return [];
      }
      
      return useFeedItemCreation({
        filteredProfiles: realProfiles || [],
        posts: posts || [],
        shuffleKey,
        userId: user?.id
      });
    } catch (error) {
      console.error('Error creating feed items:', error);
      return [];
    }
  }, [realProfiles, posts, shuffleKey, user?.id]);

  // Update displayed items when raw items change
  useEffect(() => {
    if (!rawFeedItems || !Array.isArray(rawFeedItems)) return;
    
    try {
      if (rawFeedItems.length > 0) {
        const initialItems = rawFeedItems.slice(0, 30);
        setDisplayedItems(initialItems);
        setHasMoreItems(rawFeedItems.length > 30);
        console.log('🚀 Initial feed loaded:', initialItems.length, 'items');
      } else {
        setDisplayedItems([]);
        setHasMoreItems(false);
        console.log('🚀 No feed items available');
      }
    } catch (error) {
      console.error('Error updating displayed items:', error);
      setDisplayedItems([]);
      setHasMoreItems(false);
    }
  }, [rawFeedItems]);

  // Load more items with stable dependencies
  const handleLoadMore = useCallback(() => {
    if (!rawFeedItems || !Array.isArray(rawFeedItems) || isLoadingMore || !hasMoreItems) return;
    
    console.log('🚀 Loading more items...');
    setIsLoadingMore(true);
    
    try {
      setTimeout(() => {
        const currentLength = displayedItems?.length || 0;
        const nextItems = rawFeedItems.slice(currentLength, currentLength + 20);
        
        if (nextItems.length > 0) {
          setDisplayedItems(prev => [...(prev || []), ...nextItems]);
          console.log('🚀 Loaded', nextItems.length, 'more items');
        }
        
        setHasMoreItems(currentLength + nextItems.length < rawFeedItems.length);
        setIsLoadingMore(false);
      }, 300);
    } catch (error) {
      console.error('Error loading more items:', error);
      setIsLoadingMore(false);
    }
  }, [rawFeedItems, displayedItems?.length, isLoadingMore, hasMoreItems]);

  // Refresh handler with stable dependencies
  const handleRefresh = useCallback(() => {
    console.log('🚀 Refreshing feed');
    
    try {
      setShuffleKey(Date.now() + Math.random());
      setDisplayedItems([]);
      setHasMoreItems(true);
      setIsLoadingMore(false);
      
      if (refetchPosts && typeof refetchPosts === 'function') {
        refetchPosts();
      }
    } catch (error) {
      console.error('Error refreshing feed:', error);
    }
  }, [refetchPosts]);

  // Real-time updates with stable callback dependencies
  const handleNewPost = useCallback(() => {
    console.log('📡 New post - refreshing feed');
    handleRefresh();
  }, [handleRefresh]);

  const handlePostUpdate = useCallback(() => {
    console.log('📡 Post updated - refreshing feed');
    handleRefresh();
  }, [handleRefresh]);

  const handlePostDelete = useCallback(() => {
    console.log('📡 Post deleted - refreshing feed');
    handleRefresh();
  }, [handleRefresh]);

  const handleNewProfile = useCallback(() => {
    console.log('📡 New profile - refreshing feed');
    handleRefresh();
  }, [handleRefresh]);

  // Real-time feed with stable dependencies
  useRealTimeFeed({
    onNewPost: handleNewPost,
    onPostUpdate: handlePostUpdate,
    onPostDelete: handlePostDelete,
    onNewProfile: handleNewProfile
  });

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

  // ALWAYS return a consistent object structure
  return {
    displayedItems: Array.isArray(displayedItems) ? displayedItems : [],
    hasMoreItems: Boolean(hasMoreItems),
    isLoadingMore: Boolean(isLoading || isLoadingMore),
    handleLoadMore: handleLoadMore || (() => {}),
    handleRefresh: handleRefresh || (() => {}),
    engagementTracker: engagementTracker || {},
    feedEngineStats: feedEngineStats || {
      totalCount: 0,
      distributedContent: 0,
      unusedContentCount: 0,
      activeUsers: 1,
      distributionEfficiency: 0,
      loadingState: 'loading'
    }
  };
};
