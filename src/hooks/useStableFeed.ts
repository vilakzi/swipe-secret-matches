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
  profiles: any[]; // Keep for compatibility but unused
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

  // REMOVED: No longer fetching standalone profiles
  // Only show users who have posted content
  const profiles: any[] = [];

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

  // Create optimized feed items - ONLY posts with content
  const feedItems = useMemo(() => {
    console.log('🔧 Creating optimized feed items - POSTS ONLY');
    
    // Filter posts to ensure they have valid content and profiles
    const validPosts = posts.filter(post => 
      post && 
      post.id && 
      post.content_url && 
      post.profiles?.id && 
      post.profiles?.display_name && 
      post.profiles.display_name.trim() !== ''
    );

    const postItems: FeedItem[] = validPosts.map(post => {
      const isVideo = post.content_url.includes('.mp4') || post.content_url.includes('.mov') || post.content_url.includes('.webm');
      
      return {
        id: `post-${post.id}`, // Stable key prefix
        type: 'post' as const,
        profile: {
          id: post.profiles.id,
          name: post.profiles.display_name,
          age: post.profiles.age || 25,
          image: post.profiles.profile_image_url || '/placeholder.svg',
          bio: post.profiles.bio || '',
          whatsapp: post.profiles.whatsapp || '',
          location: post.profiles.location || 'Unknown',
          gender: (post.profiles.gender === 'male' || post.profiles.gender === 'female') ? post.profiles.gender : 'male',
          userType: post.profiles.user_type || 'user',
          role: post.profiles.role || 'user',
          isRealAccount: true,
          verifications: post.profiles.verifications || {
            phoneVerified: false,
            emailVerified: true,
            photoVerified: false,
            locationVerified: false,
            premiumUser: false
          }
        },
        postImage: post.content_url,
        caption: post.caption || '',
        createdAt: post.created_at,
        isVideo,
        videoDuration: post.video_duration,
        videoThumbnail: post.video_thumbnail
      };
    });

    // Prioritize admin posts and stable sorting
    const adminPosts = postItems.filter(item => item.profile.role === 'admin');
    const regularPosts = postItems.filter(item => item.profile.role !== 'admin');
    
    // Deterministic shuffling for stable feed
    const seed = user?.id ? user.id.charCodeAt(0) : 42;
    const shuffledRegular = regularPosts.sort((a, b) => {
      const aHash = a.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), seed);
      const bHash = b.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), seed);
      return aHash - bHash;
    });

    const finalItems = [...adminPosts, ...shuffledRegular];
    
    console.log(`✅ Optimized feed: ${finalItems.length} posts (${adminPosts.length} admin, ${regularPosts.length} regular) - NO EMPTY PROFILES`);
    return finalItems;
  }, [posts, user?.id]);

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
        // Removed profile monitoring - only tracking posts now
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
    
    // Manually invalidate posts query only
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
    
    // Only invalidate posts since we removed profiles
    await queryClient.invalidateQueries({ queryKey: ['stable-posts'] });
  }, [queryClient]);

  return {
    feedItems,
    isLoading: postsLoading,
    hasMore: posts.length === pageSize,
    loadMore,
    refresh,
    handleScrollActivity,
    hasQueuedUpdates,
    updateQueueCount: updateQueue.posts.length,
    applyQueuedUpdates,
    isUserScrolling,
    totalItems: feedItems.length
  };
};