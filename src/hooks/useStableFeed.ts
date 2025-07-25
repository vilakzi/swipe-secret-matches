
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
    setHasQueuedUpdates(false);
    
    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current);
    }
    
    scrollTimeoutRef.current = setTimeout(() => {
      setIsUserScrolling(false);
    }, 2000);
  }, []);

  // Fetch posts with content - simplified query
  const { data: posts = [], isLoading: postsLoading } = useQuery({
    queryKey: ['stable-posts', currentPage],
    queryFn: async () => {
      console.log('🎯 Fetching posts with simplified query...');
      
      // First get posts
      const { data: postsData, error: postsError } = await supabase
        .from('posts')
        .select('*')
        .gt('expires_at', new Date().toISOString())
        .eq('payment_status', 'paid')
        .not('content_url', 'is', null)
        .not('content_url', 'eq', '')
        .order('created_at', { ascending: false })
        .limit(pageSize);

      if (postsError) {
        console.error('Error fetching posts:', postsError);
        throw postsError;
      }

      console.log(`✅ Raw posts fetched: ${postsData?.length || 0}`);

      // Get unique provider IDs
      const providerIds = [...new Set(postsData?.map(p => p.provider_id).filter(Boolean) || [])];
      
      let profilesData: any[] = [];
      if (providerIds.length > 0) {
        const { data: profiles, error: profilesError } = await supabase
          .from('profiles')
          .select('*')
          .in('id', providerIds);
        
        if (!profilesError && profiles) {
          profilesData = profiles;
          console.log(`✅ Profiles fetched: ${profiles.length}`);
        }
      }

      // Combine posts with profiles
      const postsWithProfiles = (postsData || []).map(post => ({
        ...post,
        profiles: profilesData.find(p => p.id === post.provider_id)
      }));

      // Simple validation - just ensure content exists
      const validPosts = postsWithProfiles.filter(post => 
        post.content_url && 
        post.content_url.trim() !== ''
      );

      console.log(`✅ Valid posts with content: ${validPosts.length}`);
      return validPosts;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 30,
  });

  // Fetch admin profiles with content - ONLY admin/superadmin accounts
  const { data: profiles = [], isLoading: profilesLoading } = useQuery({
    queryKey: ['stable-admin-profiles'],
    queryFn: async () => {
      console.log('🎯 Fetching admin profiles with images...');
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('role', 'admin') // Only admin accounts
        .eq('is_blocked', false)
        .not('profile_image_url', 'is', null)
        .not('profile_image_url', 'eq', '')
        .not('display_name', 'is', null)
        .not('display_name', 'eq', '')
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) {
        console.error('Error fetching admin profiles:', error);
        throw error;
      }

      const validProfiles = (data || []).filter(profile => 
        profile && 
        profile.id && 
        profile.display_name && 
        profile.display_name.trim() !== '' &&
        profile.profile_image_url && 
        profile.profile_image_url.trim() !== '' &&
        profile.role === 'admin'
      );

      console.log(`✅ Fetched ${validProfiles.length} valid admin profiles`);
      return validProfiles;
    },
    staleTime: 1000 * 60 * 10, // 10 minutes
    gcTime: 1000 * 60 * 30,
  });

  // Create balanced feed items with admin prioritization
  const feedItems = useMemo(() => {
    console.log('🔧 Creating balanced feed with posts and admin profiles');
    
    // Process posts - simpler validation
    const validPosts = posts.filter(post => 
      post && 
      post.id && 
      post.content_url && 
      post.content_url.trim() !== ''
    );

    const postItems: FeedItem[] = validPosts.map(post => {
      const isVideo = post.content_url.includes('.mp4') || 
                     post.content_url.includes('.mov') || 
                     post.content_url.includes('.webm');
      const isAdmin = post.profiles?.role === 'admin';
      
      return {
        id: `post-${post.id}`,
        type: 'post' as const,
        profile: {
          id: post.profiles?.id || post.provider_id,
          name: post.profiles?.display_name || 'User',
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
        createdAt: post.created_at,
        isVideo,
        videoDuration: post.video_duration,
        videoThumbnail: post.video_thumbnail,
        isAdminPost: isAdmin
      };
    });

    // Process admin profiles - only admin/superadmin accounts
    const adminProfileItems: FeedItem[] = profiles.map(profile => ({
      id: `profile-${profile.id}`,
      type: 'profile' as const,
      profile: {
        id: profile.id,
        name: profile.display_name,
        age: profile.age || 25,
        image: profile.profile_image_url,
        bio: profile.bio || '',
        whatsapp: profile.whatsapp || '',
        location: profile.location || 'Unknown',
        gender: (profile.gender === 'male' || profile.gender === 'female') ? profile.gender : 'male',
        userType: profile.user_type || 'admin',
        role: profile.role || 'admin',
        isRealAccount: true,
        verifications: profile.verifications || {
          phoneVerified: true,
          emailVerified: true,
          photoVerified: true,
          locationVerified: true,
          premiumUser: true
        }
      }
    }));

    // Combine admin posts first, then regular posts, then admin profiles
    const adminPosts = postItems.filter(item => item.isAdminPost);
    const regularPosts = postItems.filter(item => !item.isAdminPost);
    
    // Prioritize admin content
    const finalItems = [...adminPosts, ...adminProfileItems, ...regularPosts];
    
    console.log(`✅ Balanced feed: ${finalItems.length} items (${postItems.length} posts, ${adminProfileItems.length} admin profiles)`);
    return finalItems;
  }, [posts, profiles]);

  // Background update monitoring
  useEffect(() => {
    if (!enableBackgroundUpdates) return;

    const channel = supabase
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

    return () => {
      supabase.removeChannel(channel);
    };
  }, [enableBackgroundUpdates, isUserScrolling, respectUserActivity]);

  // Manual refresh
  const refresh = useCallback(async () => {
    console.log('🔄 Manual refresh initiated');
    
    setUpdateQueue({ posts: [], profiles: [], timestamp: Date.now() });
    setHasQueuedUpdates(false);
    setCurrentPage(0);
    
    await queryClient.invalidateQueries({ queryKey: ['stable-posts'] });
    await queryClient.invalidateQueries({ queryKey: ['stable-admin-profiles'] });
    
    console.log('✅ Manual refresh completed');
  }, [queryClient]);

  // Load more
  const loadMore = useCallback(() => {
    if (!isUserScrolling) {
      setCurrentPage(prev => prev + 1);
    }
  }, [isUserScrolling]);

  // Apply queued updates
  const applyQueuedUpdates = useCallback(async () => {
    console.log('🔄 Applying queued updates');
    
    setUpdateQueue({ posts: [], profiles: [], timestamp: Date.now() });
    setHasQueuedUpdates(false);
    
    await queryClient.invalidateQueries({ queryKey: ['stable-posts'] });
    await queryClient.invalidateQueries({ queryKey: ['stable-admin-profiles'] });
  }, [queryClient]);

  const isLoading = postsLoading || profilesLoading;

  return {
    feedItems,
    isLoading,
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
