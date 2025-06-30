
import { useState, useCallback, useEffect, useMemo } from 'react';
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

  // Fetch data sources with optimized loading
  const { realProfiles, loading: profilesLoading } = useRealProfiles();
  const { newJoiners, loading: newJoinersLoading } = useNewJoiners();
  const { posts, refetchPosts } = usePostFetching();

  // Optimized feed item creation with memoization
  const rawFeedItems = useMemo(() => {
    console.log('🚀 Creating optimized feed items');
    return useFeedItemCreation({
      filteredProfiles: realProfiles || [],
      posts: posts || [],
      shuffleKey,
      userId: user?.id
    });
  }, [realProfiles, posts, shuffleKey, user?.id]);

  // Update displayed items when raw items change with performance optimization
  useEffect(() => {
    if (rawFeedItems && rawFeedItems.length > 0) {
      const initialItems = rawFeedItems.slice(0, 30);
      setDisplayedItems(initialItems);
      setHasMoreItems(rawFeedItems.length > 30);
      console.log('🚀 Initial feed loaded:', initialItems.length, 'items');
    }
  }, [rawFeedItems]);

  // Optimized load more with better performance
  const handleLoadMore = useCallback(() => {
    if (!rawFeedItems || isLoadingMore || !hasMoreItems) return;
    
    console.log('🚀 Loading more items...');
    setIsLoadingMore(true);
    
    // Use requestAnimationFrame for smooth loading
    requestAnimationFrame(() => {
      setTimeout(() => {
        const currentLength = displayedItems.length;
        const nextItems = rawFeedItems.slice(currentLength, currentLength + 20);
        
        if (nextItems.length > 0) {
          setDisplayedItems(prev => [...prev, ...nextItems]);
          console.log('🚀 Loaded', nextItems.length, 'more items');
        }
        
        setHasMoreItems(currentLength + nextItems.length < rawFeedItems.length);
        setIsLoadingMore(false);
      }, 300); // Reduced delay for better UX
    });
  }, [rawFeedItems, displayedItems.length, isLoadingMore, hasMoreItems]);

  // Optimized refresh handler
  const handleRefresh = useCallback(() => {
    console.log('🚀 Refreshing feed with optimization');
    setShuffleKey(Date.now() + Math.random()); // Better randomness
    setDisplayedItems([]);
    setHasMoreItems(true);
    setIsLoadingMore(false);
    
    if (refetchPosts) {
      refetchPosts();
    }
  }, [refetchPosts]);

  // Real-time updates with debouncing
  useRealTimeFeed({
    onNewPost: useCallback(() => {
      console.log('📡 New post - refreshing feed');
      handleRefresh();
    }, [handleRefresh]),
    onPostUpdate: useCallback(() => {
      console.log('📡 Post updated - refreshing feed');
      handleRefresh();
    }, [handleRefresh]),
    onPostDelete: useCallback(() => {
      console.log('📡 Post deleted - refreshing feed');
      handleRefresh();
    }, [handleRefresh]),
    onNewProfile: useCallback(() => {
      console.log('📡 New profile - refreshing feed');
      handleRefresh();
    }, [handleRefresh])
  });

  // Engagement tracking with optimization
  const engagementTracker = useEngagementTracking();

  const isLoading = profilesLoading || newJoinersLoading;

  // Performance monitoring
  const feedEngineStats = useMemo(() => {
    return {
      totalCount: rawFeedItems?.length || 0,
      distributedContent: displayedItems.length,
      unusedContentCount: Math.max(0, (rawFeedItems?.length || 0) - displayedItems.length),
      activeUsers: 1,
      distributionEfficiency: rawFeedItems?.length > 0 ? (displayedItems.length / rawFeedItems.length) : 0,
      loadingState: isLoading ? 'loading' : 'ready'
    };
  }, [rawFeedItems, displayedItems, isLoading]);

  console.log('🚀 Feed Engine Stats:', feedEngineStats);

  return {
    displayedItems,
    hasMoreItems,
    isLoadingMore: isLoading || isLoadingMore,
    handleLoadMore,
    handleRefresh,
    engagementTracker,
    feedEngineStats
  };
};
