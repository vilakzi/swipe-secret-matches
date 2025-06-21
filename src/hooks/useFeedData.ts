
// --- Imports must come first --- //
import { useState, useMemo, useCallback, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRealProfiles } from './useRealProfiles';
import { useNewJoiners } from './useNewJoiners';
import { useFilteredFeedData } from './useFilteredFeedData';
import { useFeedPagination } from './useFeedPagination';
import { generateFeedItems } from '@/utils/feedItemGenerator';
import { FeedItem } from '@/components/feed/types/feedTypes';
import { supabase } from '@/integrations/supabase/client';

export type { FeedItem };

export const useFeedData = (itemsPerPage: number = 8) => {
  // ---- User detection must be at the top of the hook, before any other hooks ---- //
  const { user } = useAuth() || {};

  // Debug: output user value before any use
  console.debug("user value is", user);

  // --- Return default values if no user (instead of null) --- //
  if (!user) {
    return {
      displayedItems: [],
      hasMoreItems: false,
      isLoadingMore: false,
      handleLoadMore: () => {},
      handleRefresh: () => {},
    };
  }

  // --- Now, normal hooks usage --- //
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
            gender,
            role
          )
        `)
        .gt('expires_at', new Date().toISOString())
        .eq('payment_status', 'paid')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching posts:', error);
        return;
      }

      // Enhanced post processing for better prioritization
      const processedPosts = (postsData || []).map(post => ({
        ...post,
        // Add priority flag for admin posts
        isAdminPost: ['admin', 'superadmin'].includes(post.profiles?.role?.toLowerCase() || ''),
        // Add priority weight for super admin posts
        priorityWeight: post.profiles?.role?.toLowerCase() === 'superadmin' ? 5 : 
                      post.profiles?.role?.toLowerCase() === 'admin' ? 3 : 1
      }));

      setPosts(processedPosts);
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

  // Create all feed items with enhanced super admin prioritization
  const allFeedItems = useMemo(() => {
    const profileItems = generateFeedItems(filteredProfiles, shuffleKey);

    // Convert posts to feed items with admin prioritization
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
        role: post.profiles?.role || post.profiles?.user_type,
        isRealAccount: true
      },
      postImage: post.content_url,
      caption: post.caption,
      isAdminPost: post.isAdminPost,
      priorityWeight: post.priorityWeight
    }));

    // Separate user posts
    let myPostItems: FeedItem[] = [];
    let otherPostItems: FeedItem[] = [];
    
    if (user?.id) {
      myPostItems = postItems.filter(item => item.profile.id === user.id);
      otherPostItems = postItems.filter(item => item.profile.id !== user.id);
    } else {
      otherPostItems = postItems;
    }

    // Enhanced shuffling with super admin post prioritization
    const combinedItems = [...otherPostItems, ...profileItems];
    
    // Create prioritized array where super admin posts appear more frequently
    const prioritizedItems: FeedItem[] = [];
    combinedItems.forEach(item => {
      const weight = (item as any).priorityWeight || 
                    (item.profile.role?.toLowerCase() === 'superadmin' ? 5 : 
                     item.profile.role?.toLowerCase() === 'admin' ? 3 : 1);
      
      // Add multiple copies based on priority weight
      for (let i = 0; i < weight; i++) {
        prioritizedItems.push(item);
      }
    });

    const shuffledPrioritized = shuffleArray(prioritizedItems);
    
    return myPostItems.length > 0
      ? [...myPostItems, ...shuffledPrioritized]
      : shuffledPrioritized;
  }, [filteredProfiles, posts, shuffleKey, user?.id]);

  // Handle pagination with increased default
  const {
    displayedItems,
    hasMoreItems,
    isLoadingMore: paginationLoading,
    handleLoadMore,
    resetPagination
  } = useFeedPagination(allFeedItems, itemsPerPage);

  const isLoadingMore = paginationLoading || profilesLoading || newJoinersLoading;

  // Enhanced refresh with super admin prioritization
  const handleRefresh = useCallback(() => {
    console.log('Refreshing feed with super admin prioritization');
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

// Enhanced shuffle with better distribution
function shuffleArray<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}
