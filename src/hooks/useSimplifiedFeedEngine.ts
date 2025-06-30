
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
  
  // Initialize all hooks first to maintain consistent order
  const [shuffleKey, setShuffleKey] = useState(() => Date.now());
  const [displayedItems, setDisplayedItems] = useState([]);
  const [hasMoreItems, setHasMoreItems] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  // Engagement tracking moved up to maintain hook order
  const engagementTracker = useEngagementTracking();

  // Fetch data sources with optimized loading
  const { realProfiles, loading: profilesLoading } = useRealProfiles();
  const { newJoiners, loading: newJoinersLoading } = useNewJoiners();
  const { posts, refetchPosts } = usePostFetching();

  // Optimized feed item creation with memoization and null checks
  const rawFeedItems = useMemo(() => {
    console.log('🚀 Creating optimized feed items');
    if (!realProfiles || !posts) {
      console.log('⏳ Waiting for data to load...');
      return [];
    }
    
    try {
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

  // Update displayed items when raw items change with performance optimization
  useEffect(() => {
    if (rawFeedItems && rawFeedItems.length > 0) {
      const initialItems = rawFeedItems.slice(0, 30);
      setDisplayedItems(initialItems);
      setHasMoreItems(rawFeedItems.length > 30);
      console.log('🚀 Initial feed loaded:', initialItems.length, 'items');
    } else if (rawFeedItems && rawFeedItems.length === 0) {
      setDisplayedItems([]);
      setHasMoreItems(false);
      console.log('🚀 No feed items available');
    }
  }, [rawFeedItems]);

  // Optimized load more with better performance and error handling
  const handleLoadMore = useCallback(() => {
    if (!rawFeedItems || isLoadingMore || !hasMoreItems) return;
    
    console.log('🚀 Loading more items...');
    setIsLoadingMore(true);
    
    // Use requestAnimationFrame for smooth loading
    requestAnimationFrame(() => {
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
          console.error('Error loading more items:', error);
        } finally {
          setIsLoadingMore(false);
        }
      }, 300);
    });
  }, [rawFeedItems, displayedItems.length, isLoadingMore, hasMoreItems]);

  // Optimized refresh handler
  const handleRefresh = useCallback(() => {
    console.log('🚀 Refreshing feed with optimization');
    setShuffleKey(Date.now() + Math.random());
    setDisplayedItems([]);
    setHasMoreItems(true);
    setIsLoadingMore(false);
    
    if (refetchPosts) {
      try {
        refetchPosts();
      } catch (error) {
        console.error('Error refetching posts:', error);
      }
    }
  }, [refetchPosts]);

  // Real-time updates with debouncing and error handling
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

  const isLoading = profilesLoading || newJoinersLoading;

  // Performance monitoring with null checks
  const feedEngineStats = useMemo(() => {
    const totalCount = rawFeedItems?.length || 0;
    const distributedContent = displayedItems?.length || 0;
    
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

  return {
    displayedItems: displayedItems || [],
    hasMoreItems: hasMoreItems || false,
    isLoadingMore: isLoading || isLoadingMore,
    handleLoadMore,
    handleRefresh,
    engagementTracker,
    feedEngineStats
  };
};
