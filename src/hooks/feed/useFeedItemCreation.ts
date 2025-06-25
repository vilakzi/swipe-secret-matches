
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
    console.log('Creating feed with NO duplication algorithm, shuffle key:', shuffleKey);
    
    // Convert profiles to feed items - only real profiles, no demo data
    const profileItems: FeedItem[] = filteredProfiles.map(profile => ({
      id: `profile-${profile.id}`,
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
        isRealAccount: profile.isRealAccount || true,
        verifications: profile.verifications || {
          phoneVerified: false,
          emailVerified: true,
          photoVerified: false,
          locationVerified: false,
          premiumUser: false
        }
      }
    }));

    // Convert posts to feed items with admin prioritization
    const postItems: FeedItem[] = posts.map(post => {
      const role = post.profiles?.role?.toLowerCase() || '';
      const isAdmin = ['admin'].includes(role);
      
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
        isAdminPost: isAdmin,
        priorityWeight: isAdmin ? 10 : 1,
        boostFactor: isAdmin ? 3.0 : 1.0,
        createdAt: post.created_at
      };
    });

    // Separate user's own posts from other posts to prevent duplication
    let myPostItems: FeedItem[] = [];
    let otherPostItems: FeedItem[] = [];
    
    if (userId) {
      myPostItems = postItems.filter(item => item.profile.id === userId);
      otherPostItems = postItems.filter(item => item.profile.id !== userId);
    } else {
      otherPostItems = postItems;
    }

    // FIXED ALGORITHM: Simple shuffle with NO duplication
    const allOtherItems = [...otherPostItems, ...profileItems];
    
    // Separate admin content from regular content
    const adminItems = allOtherItems.filter(item => 
      (item as any).isAdminPost || 
      item.profile.role?.toLowerCase() === 'admin'
    );
    const regularItems = allOtherItems.filter(item => 
      !(item as any).isAdminPost && 
      item.profile.role?.toLowerCase() !== 'admin'
    );

    console.log(`Feed composition: ${adminItems.length} admin items, ${regularItems.length} regular items`);

    // Simple approach: Mix admin and regular content without complex interleaving
    const shuffledAdmin = shuffleArrayWithSeed(adminItems, shuffleKey);
    const shuffledRegular = shuffleArrayWithSeed(regularItems, shuffleKey + 1);
    
    // Basic merge: Add admin items first (for priority), then regular items
    // This ensures NO DUPLICATION while maintaining admin priority
    const mergedItems = [...shuffledAdmin, ...shuffledRegular];

    // Prepend user's own posts at the top (if any)
    const result = myPostItems.length > 0
      ? [...myPostItems, ...mergedItems]
      : mergedItems;

    console.log(`Final feed: ${result.length} items total (${myPostItems.length} own posts, ${adminItems.length} admin, ${regularItems.length} regular) - NO DUPLICATES`);
    return result;
  }, [filteredProfiles, posts, shuffleKey, userId]);

  return allFeedItems;
};
