
import { useState, useMemo, useCallback, useEffect } from 'react';
import { useRealProfiles } from './useRealProfiles';
import { useNewJoiners } from './useNewJoiners';
import { useFilteredFeedData } from './useFilteredFeedData';
import { useProfileFilters } from './useProfileFilters';
import { useFeedPagination } from './useFeedPagination';
import { generateFeedItems, type FeedItem } from '@/utils/feedItemGenerator';
import { supabase } from '@/integrations/supabase/client';

export type { FeedItem };

export const useFeedData = (itemsPerPage: number = 6) => {
  const [filterGender, setFilterGender] = useState<'male' | 'female' | null>(null);
  const [filterName, setFilterName] = useState<string>('');
  const [shuffleKey, setShuffleKey] = useState(0);
  const [posts, setPosts] = useState<any[]>([]);
  
  const { realProfiles, loading: profilesLoading } = useRealProfiles();
  const { newJoiners, loading: newJoinersLoading } = useNewJoiners();

  // Fetch posts from Supabase
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

  // Use only real profiles from database
  const allProfiles = useMemo(() => {
    console.log(`Total profiles: ${realProfiles.length} (all real accounts)`);
    return realProfiles;
  }, [realProfiles]);

  // Apply role-based filtering with posts data
  const roleFilteredProfiles = useFilteredFeedData(allProfiles, newJoiners, posts);

  // Apply gender and name filters
  const filteredProfiles = useProfileFilters(roleFilteredProfiles, filterGender, filterName);

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

    // Mix posts with profile items
    const mixed = [...postItems, ...profileItems].sort(() => Math.random() - 0.5);
    return mixed;
  }, [filteredProfiles, posts, shuffleKey]);

  // Handle pagination
  const {
    displayedItems,
    hasMoreItems,
    isLoadingMore: paginationLoading,
    handleLoadMore,
    resetPagination
  } = useFeedPagination(allFeedItems, itemsPerPage);

  const isLoadingMore = paginationLoading || profilesLoading || newJoinersLoading;

  // Reset pagination when filter changes
  const handleFilterChange = useCallback((gender: 'male' | 'female' | null) => {
    console.log('Filter change - gender:', gender);
    setFilterGender(gender);
    resetPagination();
    setShuffleKey(prev => prev + 1);
  }, [resetPagination]);

  const handleNameFilterChange = useCallback((name: string) => {
    console.log('Filter change - name:', name);
    setFilterName(name);
    resetPagination();
    setShuffleKey(prev => prev + 1);
  }, [resetPagination]);

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
    filterGender,
    filterName,
    handleLoadMore,
    handleFilterChange,
    handleNameFilterChange,
    handleRefresh
  };
};
