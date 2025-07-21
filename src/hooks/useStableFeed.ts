import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { FeedItem } from '@/components/feed/types/feedTypes';

interface StableFeedOptions {
  pageSize?: number;
  enableBackgroundUpdates?: boolean;
  respectUserActivity?: boolean;
}

interface UpdateQueue {
  posts: any[];
  profiles: any[];
  timestamp: number;
}

export const useStableFeed = (options: StableFeedOptions = {}) => {
  const { pageSize = 20, enableBackgroundUpdates = false, respectUserActivity = true } = options;
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  const [currentPage, setCurrentPage] = useState(0);
  const [isUserScrolling, setIsUserScrolling] = useState(false);
  const [updateQueue, setUpdateQueue] = useState<UpdateQueue>({ posts: [], profiles: [], timestamp: Date.now() });
  const [hasQueuedUpdates, setHasQueuedUpdates] = useState(false);
  const scrollTimeoutRef = useRef<NodeJS.Timeout>();

  // Track user scrolling activity
  const handleScrollActivity = useCallback(() => {
    setIsUserScrolling(true);
    setHasQueuedUpdates(false); // Hide update indicator while scrolling
    
    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current);
    }
    
    scrollTimeoutRef.current = setTimeout(() => {
      setIsUserScrolling(false);
    }, 2000); // Consider user inactive after 2 seconds of no scrolling
  }, []);

  // Stable profiles query - no auto invalidation
  const { data: profiles = [], isLoading: profilesLoading } = useQuery({
    queryKey: ['stable-profiles'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('is_blocked', false)
        .limit(100);

      if (error) throw error;
      return data || [];
    },
    staleTime: Infinity, // Never auto-refetch
    gcTime: 1000 * 60 * 30, // 30 minutes cache
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
  });

  // Stable posts query - no auto invalidation
  const { data: posts = [], isLoading: postsLoading } = useQuery({
    queryKey: ['stable-posts', currentPage],
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
    staleTime: Infinity, // Never auto-refetch
    gcTime: 1000 * 60 * 30, // 30 minutes cache
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
  });

  // Create stable feed items with preserved keys
  const feedItems = useMemo(() => {
    console.log('🔧 Creating stable feed items');
    
    const profileItems: FeedItem[] = profiles.map(profile => ({
      id: `profile-${profile.id}`, // Stable key prefix
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
      id: `post-${post.id}`, // Stable key prefix
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

    // Stable shuffling with deterministic seed based on user ID
    const allItems = [...postItems, ...profileItems];
    const seed = user?.id ? user.id.charCodeAt(0) : 42;
    
    return allItems.sort((a, b) => {
      const aHash = a.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), seed);
      const bHash = b.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), seed);
      return aHash - bHash;
    });
  }, [profiles, posts, user?.id]);

  // Background update monitoring (only when enabled)
  useEffect(() => {
    if (!enableBackgroundUpdates) return;

    let updateChannel: any;
    
    const setupBackgroundUpdates = () => {
      updateChannel = supabase
        .channel('background-feed-updates')
        .on('postgres_changes', {
          event: '*',
          schema: 'public',
          table: 'posts'
        }, (payload) => {
          if (!isUserScrolling || !respectUserActivity) {
            console.log('📦 Queuing post update:', payload);
            setUpdateQueue(prev => ({
              ...prev,
              posts: [...prev.posts, payload],
              timestamp: Date.now()
            }));
            setHasQueuedUpdates(true);
          }
        })
        .on('postgres_changes', {
          event: '*',
          schema: 'public',
          table: 'profiles'
        }, (payload) => {
          if (!isUserScrolling || !respectUserActivity) {
            console.log('📦 Queuing profile update:', payload);
            setUpdateQueue(prev => ({
              ...prev,
              profiles: [...prev.profiles, payload],
              timestamp: Date.now()
            }));
            setHasQueuedUpdates(true);
          }
        })
        .subscribe();
    };

    setupBackgroundUpdates();

    return () => {
      if (updateChannel) {
        supabase.removeChannel(updateChannel);
      }
    };
  }, [enableBackgroundUpdates, isUserScrolling, respectUserActivity]);

  // Manual refresh - user controlled only
  const refresh = useCallback(async () => {
    console.log('🔄 Manual refresh initiated');
    
    // Clear update queue
    setUpdateQueue({ posts: [], profiles: [], timestamp: Date.now() });
    setHasQueuedUpdates(false);
    
    // Reset pagination
    setCurrentPage(0);
    
    // Manually invalidate queries
    await queryClient.invalidateQueries({ queryKey: ['stable-profiles'] });
    await queryClient.invalidateQueries({ queryKey: ['stable-posts'] });
    
    console.log('✅ Manual refresh completed');
  }, [queryClient]);

  // Load more - controlled pagination
  const loadMore = useCallback(() => {
    if (!isUserScrolling) { // Only load more when user is not actively scrolling
      setCurrentPage(prev => prev + 1);
    }
  }, [isUserScrolling]);

  // Apply queued updates - user controlled
  const applyQueuedUpdates = useCallback(async () => {
    console.log('🔄 Applying queued updates');
    
    setUpdateQueue({ posts: [], profiles: [], timestamp: Date.now() });
    setHasQueuedUpdates(false);
    
    await queryClient.invalidateQueries({ queryKey: ['stable-profiles'] });
    await queryClient.invalidateQueries({ queryKey: ['stable-posts'] });
  }, [queryClient]);

  return {
    feedItems,
    isLoading: profilesLoading || postsLoading,
    hasMore: posts.length === pageSize,
    loadMore,
    refresh,
    handleScrollActivity,
    hasQueuedUpdates,
    updateQueueCount: updateQueue.posts.length + updateQueue.profiles.length,
    applyQueuedUpdates,
    isUserScrolling,
    totalItems: feedItems.length
  };
};