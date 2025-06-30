
import { useState, useCallback, useEffect, useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRealProfiles } from './useRealProfiles';
import { useNewJoiners } from './useNewJoiners';
import { usePostFetching } from './feed/usePostFetching';
import { useFeedItemCreation } from './feed/useFeedItemCreation';
import { useEngagementTracking } from './feed/useEngagementTracking';
import { useRealTimeFeed } from './useRealTimeFeed';

export const useSimplifiedFeedEngine = () => {
  // All hooks must be called at the top level in consistent order
  const { user } = useAuth() || {};
  const [shuffleKey, setShuffleKey] = useState(() => Date.now());
  const [displayedItems, setDisplayedItems] = useState([]);
  const [hasMoreItems, setHasMoreItems] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  // Initialize engagement tracking early to maintain hook order
  const engagementTracker = useEngagementTracking();

  // Fetch data sources
  const { realProfiles, loading: profilesLoading } = useRealProfiles();
  const { newJoiners, loading: newJoinersLoading } = useNewJoiners();
  const { posts, refetchPosts } = usePostFetching();

  // Create feed items with error boundaries
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
    if (!rawFeedItems) return;
    
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

  // Load more items with error handling
  const handleLoadMore = useCallback(() => {
    if (!rawFeedItems || isLoadingMore || !hasMoreItems) return;
    
    console.log('🚀 Loading more items...');
    setIsLoadingMore(true);
    
    try {
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
    } catch (error) {
      console.error('Error loading more items:', error);
      setIsLoadingMore(false);
    }
  }, [rawFeedItems, displayedItems.length, isLoadingMore, hasMoreItems]);

  // Refresh handler
  const handleRefresh = useCallback(() => {
    console.log('🚀 Refreshing feed');
    
    try {
      setShuffleKey(Date.now() + Math.random());
      setDisplayedItems([]);
      setHasMoreItems(true);
      setIsLoadingMore(false);
      
      if (refetchPosts) {
        refetchPosts();
      }
    } catch (error) {
      console.error('Error refreshing feed:', error);
    }
  }, [refetchPosts]);

  // Real-time updates
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

  // Feed statistics
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
