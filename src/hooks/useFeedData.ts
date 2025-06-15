
// User detection FIRST, before any React hooks
let user = undefined;
try {
  user = getAuth().currentUser;
} catch (e) {
  user = null;
}

// Early return if no user, before any hooks!
if (!user) return null;

import { useState, useMemo, useCallback, useEffect } from 'react';
import { useRealProfiles } from './useRealProfiles';
import { useNewJoiners } from './useNewJoiners';
import { useFilteredFeedData } from './useFilteredFeedData';
import { useFeedPagination } from './useFeedPagination';
import { generateFeedItems, type FeedItem } from '@/utils/feedItemGenerator';
import { supabase } from '@/integrations/supabase/client';

export type { FeedItem };

export const useFeedData = (itemsPerPage: number = 6) => {
  const [shuffleKey, setShuffleKey] = useState(0);
  const [posts, setPosts] = useState<any[]>([]);

  const { realProfiles, loading: profilesLoading } = useRealProfiles();
  const { newJoiners, loading: newJoinersLoading } = useNewJoiners();

  const fetchPosts = useCallback(async () => {
    try {
      const { data: postsData, error } = await supabase
        .from('posts')
        .select(`
          *,
          profiles!posts_provider_id_fkey(
            id,
            display_name,
            profile_image_url,
            location,
            user_type,
            age,
            bio,
            whatsapp,
            gender
          )
        `)
        .gt('expires_at', new Date().toISOString())
        .eq('payment_status', 'paid')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching posts:', error);
        return;
      }

      setPosts(postsData || []);
    } catch (error) {
      console.error('Error in fetchPosts:', error);
    }
  }, []);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  const allProfiles = useMemo(() => {
    console.log(`Total profiles: ${realProfiles.length} (all real accounts)`);
    return realProfiles;
  }, [realProfiles]);

  // Apply role-based filtering with posts data
  const roleFilteredProfiles = useFilteredFeedData(allProfiles, newJoiners, posts);

  // All profiles are used; no further filtering
  const filteredProfiles = roleFilteredProfiles;

  // Create all feed items (including posts)
  const allFeedItems = useMemo(() => {
    const profileItems = generateFeedItems(filteredProfiles, shuffleKey);

    // Convert posts to feed items
    const postItems: FeedItem[] = posts.map(post => ({
      id: `post-${post.id}`,
      type: 'post' as const,
      profile: {
        id: post.profiles?.id || post.provider_id,
        name: post.profiles?.display_name || 'Anonymous',
        age: post.profiles?.age || 25,
        image: post.profiles?.profile_image_url || '/placeholder.svg',
        bio: post.profiles?.bio || '',
        whatsapp: post.profiles?.whatsapp || '',
        location: post.profiles?.location || 'Unknown',
        gender: post.profiles?.gender as 'male' | 'female' || 'male',
        userType: post.profiles?.user_type as 'user' | 'service_provider' || 'user',
        isRealAccount: true
      },
      postImage: post.content_url,
      caption: post.caption
    }));

    // Separate out posts belonging to currently logged-in user
    let myPostItems: FeedItem[] = [];
    let otherPostItems: FeedItem[] = [];
    
    if (user) {
      if (user.id) {
        myPostItems = postItems.filter(item => item.profile.id === user.id);
        otherPostItems = postItems.filter(item => item.profile.id !== user.id);
      } else {
        otherPostItems = postItems;
      }

      // Sort: your posts first, then mix in others and profile items
      return myPostItems.length > 0
        ? [...myPostItems, ...shuffleArray([...otherPostItems, ...profileItems])]
        : [...postItems, ...profileItems].sort(() => Math.random() - 0.5);
    } else {
      // No user: just mix everything (should not occur with the above guard, but fallback)
      return [...postItems, ...profileItems].sort(() => Math.random() - 0.5);
    }
  }, [filteredProfiles, posts, shuffleKey, user?.id]);

  // Handle pagination
  const {
    displayedItems,
    hasMoreItems,
    isLoadingMore: paginationLoading,
    handleLoadMore,
    resetPagination
  } = useFeedPagination(allFeedItems, itemsPerPage);

  const isLoadingMore = paginationLoading || profilesLoading || newJoinersLoading;

  // Unified, only refresh-related handler
  const handleRefresh = useCallback(() => {
    console.log('Refreshing feed');
    resetPagination();
    fetchPosts();
    setShuffleKey(prev => prev + 1);
  }, [resetPagination, fetchPosts]);

  return {
    displayedItems,
    hasMoreItems,
    isLoadingMore,
    handleLoadMore,
    handleRefresh
  };
};

// --- Utility --- //
function shuffleArray<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

