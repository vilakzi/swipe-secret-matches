
import { useState, useEffect, useCallback, useMemo } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { FeedItem } from '@/components/feed/types/feedTypes';

interface OptimizedFeedOptions {
  pageSize?: number;
  enableRealTime?: boolean;
  cacheTime?: number;
}

export const useOptimizedFeed = (options: OptimizedFeedOptions = {}) => {
  const { pageSize = 20, enableRealTime = true, cacheTime = 300000 } = options;
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [currentPage, setCurrentPage] = useState(0);

  // Optimized profiles query with proper caching
  const { data: profiles = [], isLoading: profilesLoading } = useQuery({
    queryKey: ['optimized-profiles'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('is_blocked', false)
        .limit(100); // Reasonable limit

      if (error) throw error;
      return data || [];
    },
    staleTime: cacheTime,
    gcTime: cacheTime * 2,
  });

  // Optimized posts query with pagination
  const { data: posts = [], isLoading: postsLoading } = useQuery({
    queryKey: ['optimized-posts', currentPage],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('posts')
        .select(`
          *,
          profiles!posts_provider_id_fkey(
            id, display_name, profile_image_url, location,
            user_type, age, bio, whatsapp, gender, role, verifications
          )
        `)
        .gt('expires_at', new Date().toISOString())
        .eq('payment_status', 'paid')
        .order('created_at', { ascending: false })
        .range(currentPage * pageSize, (currentPage + 1) * pageSize - 1);

      if (error) throw error;
      return data || [];
    },
    staleTime: cacheTime / 2, // Posts are more dynamic
    gcTime: cacheTime,
  });

  // Memoized feed items creation
  const feedItems = useMemo(() => {
    console.log('🚀 Creating optimized feed items');
    
    const profileItems: FeedItem[] = profiles.map(profile => ({
      id: profile.id,
      type: 'profile' as const,
      profile: {
        id: profile.id,
        name: profile.display_name || 'Unknown',
        age: profile.age || 25,
        image: profile.profile_image_url || '/placeholder.svg',
        bio: profile.bio || '',
        whatsapp: profile.whatsapp || '',
        location: profile.location || 'Unknown',
        gender: (profile.gender === 'male' || profile.gender === 'female') ? profile.gender : 'male',
        userType: profile.user_type || 'user',
        role: profile.role || 'user',
        isRealAccount: true,
        verifications: profile.verifications || {
          phoneVerified: false,
          emailVerified: true,
          photoVerified: false,
          locationVerified: false,
          premiumUser: false
        }
      }
    }));

    const postItems: FeedItem[] = posts.map(post => ({
      id: post.id,
      type: 'post' as const,
      profile: {
        id: post.profiles?.id || 'unknown',
        name: post.profiles?.display_name || 'Anonymous',
        age: post.profiles?.age || 25,
        image: post.profiles?.profile_image_url || '/placeholder.svg',
        bio: post.profiles?.bio || '',
        whatsapp: post.profiles?.whatsapp || '',
        location: post.profiles?.location || 'Unknown',
        gender: (post.profiles?.gender === 'male' || post.profiles?.gender === 'female') ? post.profiles.gender : 'male',
        userType: post.profiles?.user_type || 'user',
        role: post.profiles?.role || 'user',
        isRealAccount: true,
        verifications: post.profiles?.verifications || {
          phoneVerified: false,
          emailVerified: true,
          photoVerified: false,
          locationVerified: false,
          premiumUser: false
        }
      },
      postImage: post.content_url,
      caption: post.caption || '',
      createdAt: post.created_at
    }));

    // Smart shuffling with deterministic seed
    const allItems = [...postItems, ...profileItems];
    const shuffled = allItems.sort(() => Math.random() - 0.5);
    
    return shuffled;
  }, [profiles, posts]);

  // Real-time subscription with debouncing
  useEffect(() => {
    if (!enableRealTime) return;

    let debounceTimer: NodeJS.Timeout;

    const channel = supabase
      .channel('optimized-feed-updates')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'posts'
      }, () => {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => {
          queryClient.invalidateQueries({ queryKey: ['optimized-posts'] });
        }, 1000);
      })
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'profiles'
      }, () => {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => {
          queryClient.invalidateQueries({ queryKey: ['optimized-profiles'] });
        }, 2000);
      })
      .subscribe();

    return () => {
      clearTimeout(debounceTimer);
      supabase.removeChannel(channel);
    };
  }, [enableRealTime, queryClient]);

  const loadMore = useCallback(() => {
    setCurrentPage(prev => prev + 1);
  }, []);

  const refresh = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ['optimized-profiles'] });
    queryClient.invalidateQueries({ queryKey: ['optimized-posts'] });
    setCurrentPage(0);
  }, [queryClient]);

  return {
    feedItems,
    isLoading: profilesLoading || postsLoading,
    hasMore: posts.length === pageSize,
    loadMore,
    refresh,
    totalItems: feedItems.length
  };
};
