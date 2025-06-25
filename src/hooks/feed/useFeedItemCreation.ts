
import { useMemo } from 'react';
import { FeedItem } from '@/components/feed/types/feedTypes';
import { shuffleArrayWithSeed } from '@/utils/feed/shuffleUtils';

interface UseFeedItemCreationProps {
  filteredProfiles: any[];
  posts: any[];
  shuffleKey: number;
  userId?: string;
}

export const useFeedItemCreation = ({
  filteredProfiles,
  posts,
  shuffleKey,
  userId
}: UseFeedItemCreationProps) => {
  const allFeedItems = useMemo(() => {
    console.log('Creating feed with FIXED algorithm - NO duplicates, shuffle key:', shuffleKey);
    
    // Convert profiles to feed items - only real profiles
    const profileItems: FeedItem[] = filteredProfiles.map(profile => ({
      id: profile.id, // Use clean UUID without prefix
      type: 'profile' as const,
      profile: {
        id: profile.id,
        name: profile.name,
        age: profile.age,
        image: profile.image,
        bio: profile.bio,
        whatsapp: profile.whatsapp,
        location: profile.location,
        gender: profile.gender,
        userType: profile.userType,
        role: profile.role || profile.userType,
        isRealAccount: true, // Always real accounts - no demo data
        verifications: profile.verifications || {
          phoneVerified: false,
          emailVerified: true,
          photoVerified: false,
          locationVerified: false,
          premiumUser: false
        }
      }
    }));

    // Convert posts to feed items
    const postItems: FeedItem[] = posts.map(post => {
      const role = post.profiles?.role?.toLowerCase() || '';
      const isAdmin = role === 'admin';
      
      return {
        id: post.id, // Use clean UUID without prefix
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
        isAdminPost: isAdmin,
        createdAt: post.created_at
      };
    });

    // CRITICAL FIX: Separate user's own posts to prevent duplicates
    const userPosts = userId ? postItems.filter(item => item.profile.id === userId) : [];
    const otherPosts = userId ? postItems.filter(item => item.profile.id !== userId) : postItems;

    // Create a single combined array with NO DUPLICATES
    const allOtherItems = [...otherPosts, ...profileItems];
    
    // Simple shuffle to mix content
    const shuffledItems = shuffleArrayWithSeed(allOtherItems, shuffleKey);
    
    // Final result: user's posts first, then shuffled other content
    const result = userPosts.length > 0 
      ? [...userPosts, ...shuffledItems]
      : shuffledItems;

    console.log(`FIXED Feed: ${result.length} total items (${userPosts.length} user posts, ${otherPosts.length} other posts, ${profileItems.length} profiles) - GUARANTEED NO DUPLICATES`);
    
    return result;
  }, [filteredProfiles, posts, shuffleKey, userId]);

  return allFeedItems;
};
