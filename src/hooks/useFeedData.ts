
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
            role,
            verifications
          )
        `)
        .gt('expires_at', new Date().toISOString())
        .eq('payment_status', 'paid')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching posts:', error);
        return;
      }

      // Enhanced post processing with super admin prioritization
      const processedPosts = (postsData || []).map(post => {
        const role = post.profiles?.role?.toLowerCase() || '';
        const isSuperAdmin = ['admin'].includes(role); // Treating admin as super admin for now
        
        return {
          ...post,
          // Enhanced priority system
          isAdminPost: isSuperAdmin,
          isSuperAdminPost: isSuperAdmin,
          priorityWeight: isSuperAdmin ? 10 : 1, // Super high priority for admins
          // Add boost factor for algorithm
          boostFactor: isSuperAdmin ? 5.0 : 1.0
        };
      });

      console.log('Processed posts with admin priority:', processedPosts.length);
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

  // Create all feed items with enhanced super admin algorithm
  const allFeedItems = useMemo(() => {
    console.log('Creating feed with super admin algorithm, shuffle key:', shuffleKey);
    
    const profileItems = generateFeedItems(filteredProfiles, shuffleKey);

    // Convert posts to feed items with enhanced admin prioritization
    const postItems: FeedItem[] = posts.map(post => {
      const role = post.profiles?.role?.toLowerCase() || '';
      const isSuperAdmin = ['admin'].includes(role);
      
      return {
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
        caption: post.caption,
        isAdminPost: isSuperAdmin,
        isSuperAdminPost: isSuperAdmin,
        priorityWeight: isSuperAdmin ? 10 : 1,
        boostFactor: isSuperAdmin ? 5.0 : 1.0,
        createdAt: post.created_at
      };
    });

    // Separate user's own posts
    let myPostItems: FeedItem[] = [];
    let otherPostItems: FeedItem[] = [];
    
    if (user?.id) {
      myPostItems = postItems.filter(item => item.profile.id === user.id);
      otherPostItems = postItems.filter(item => item.profile.id !== user.id);
    } else {
      otherPostItems = postItems;
    }

    // Advanced social media algorithm with super admin bias
    const combinedItems = [...otherPostItems, ...profileItems];
    
    // Create weighted distribution favoring super admins
    const weightedItems: FeedItem[] = [];
    
    // Separate super admin content from regular content
    const superAdminItems = combinedItems.filter(item => 
      (item as any).isSuperAdminPost || 
      item.profile.role?.toLowerCase() === 'admin'
    );
    const regularItems = combinedItems.filter(item => 
      !(item as any).isSuperAdminPost && 
      item.profile.role?.toLowerCase() !== 'admin'
    );

    console.log(`Super admin items: ${superAdminItems.length}, Regular items: ${regularItems.length}`);

    // Social media algorithm: Inject super admin content frequently
    const totalRegularSlots = Math.max(regularItems.length, 20);
    const adminInjectionRate = Math.min(superAdminItems.length, Math.ceil(totalRegularSlots / 3)); // Every 3rd item can be admin
    
    // Shuffle both arrays independently for variety
    const shuffledSuperAdmin = shuffleArrayWithSeed(superAdminItems, shuffleKey);
    const shuffledRegular = shuffleArrayWithSeed(regularItems, shuffleKey + 1);
    
    // Interleave content with super admin bias
    let adminIndex = 0;
    let regularIndex = 0;
    
    for (let i = 0; i < totalRegularSlots + adminInjectionRate; i++) {
      // Every 2-3 positions, try to inject super admin content
      const shouldInjectAdmin = (i % 2 === 0 || i % 3 === 0) && 
                                adminIndex < shuffledSuperAdmin.length;
      
      if (shouldInjectAdmin) {
        // Add super admin content with multiple copies for higher visibility
        const adminItem = shuffledSuperAdmin[adminIndex % shuffledSuperAdmin.length];
        weightedItems.push(adminItem);
        
        // Add extra copies of super admin content for algorithm boost
        if (Math.random() > 0.3) { // 70% chance to add extra copy
          weightedItems.push(adminItem);
        }
        adminIndex++;
      }
      
      // Add regular content
      if (regularIndex < shuffledRegular.length) {
        weightedItems.push(shuffledRegular[regularIndex]);
        regularIndex++;
      }
    }

    // Final shuffle while maintaining admin content frequency
    const finalFeed = algorithmicShuffle(weightedItems, shuffleKey);
    
    // Prepend user's own posts at the top
    const result = myPostItems.length > 0
      ? [...myPostItems, ...finalFeed]
      : finalFeed;

    console.log(`Final feed composition: ${result.length} items (${myPostItems.length} own posts)`);
    return result;
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

  // Enhanced refresh with algorithm reset
  const handleRefresh = useCallback(() => {
    console.log('Refreshing feed with new algorithm shuffle');
    resetPagination();
    fetchPosts();
    // Generate new shuffle key for fresh algorithm results
    setShuffleKey(prev => prev + Math.floor(Math.random() * 1000));
  }, [resetPagination, fetchPosts]);

  return {
    displayedItems,
    hasMoreItems,
    isLoadingMore,
    handleLoadMore,
    handleRefresh
  };
};

// Enhanced shuffle with seed for consistent results during same session
function shuffleArrayWithSeed<T>(array: T[], seed: number): T[] {
  const arr = [...array];
  let currentSeed = seed;
  
  for (let i = arr.length - 1; i > 0; i--) {
    // Pseudo-random number generator with seed
    currentSeed = (currentSeed * 9301 + 49297) % 233280;
    const j = Math.floor((currentSeed / 233280) * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

// Advanced algorithmic shuffle that maintains content priority
function algorithmicShuffle<T>(array: T[], seed: number): T[] {
  const arr = [...array];
  let currentSeed = seed;
  
  // Light shuffle to maintain algorithm benefits while adding variety
  for (let i = 0; i < arr.length; i += 2) {
    if (i + 1 < arr.length) {
      currentSeed = (currentSeed * 1103515245 + 12345) % 2147483647;
      if ((currentSeed / 2147483647) > 0.7) { // 30% chance to swap adjacent items
        [arr[i], arr[i + 1]] = [arr[i + 1], arr[i]];
      }
    }
  }
  
  return arr;
}
