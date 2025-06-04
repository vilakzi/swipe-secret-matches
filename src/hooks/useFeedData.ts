
import { useState, useMemo, useCallback, useEffect } from 'react';
import { demoProfiles } from '@/data/demoProfiles';
import { useRealProfiles } from './useRealProfiles';
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
  
  const { realProfiles, loading } = useRealProfiles();

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

  // Combine real profiles with demo profiles
  const allProfiles = useMemo(() => {
    // Mark demo profiles as not real accounts
    const demoProfilesWithFlag = demoProfiles.map(profile => ({
      ...profile,
      isRealAccount: false
    }));
    
    const combined = [...realProfiles, ...demoProfilesWithFlag];
    console.log(`Total profiles: ${combined.length} (${realProfiles.length} real + ${demoProfiles.length} demo)`);
    return combined;
  }, [realProfiles]);

  console.log('Total combined profiles:', allProfiles.length);
  console.log('Filter gender:', filterGender);
  console.log('Filter name:', filterName);

  // Apply filters
  const filteredProfiles = useProfileFilters(allProfiles, filterGender, filterName);

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

  const isLoadingMore = paginationLoading || loading;

  // Reset pagination when filter changes
  const handleFilterChange = useCallback((gender: 'male' | 'female' | null) => {
    console.log('Filter change - gender:', gender);
    setFilterGender(gender);
    resetPagination();
    // Trigger re-shuffle when filter changes
    setShuffleKey(prev => prev + 1);
  }, [resetPagination]);

  const handleNameFilterChange = useCallback((name: string) => {
    console.log('Filter change - name:', name);
    setFilterName(name);
    resetPagination();
    // Trigger re-shuffle when name filter changes
    setShuffleKey(prev => prev + 1);
  }, [resetPagination]);

  const handleRefresh = useCallback(() => {
    console.log('Refreshing feed');
    resetPagination();
    fetchPosts(); // Refresh posts from database
    // Trigger re-shuffle on refresh for dynamic order
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
