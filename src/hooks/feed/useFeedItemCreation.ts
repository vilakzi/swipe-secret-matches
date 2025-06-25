
import { useMemo } from 'react';
import { FeedItem } from '@/components/feed/types/feedTypes';
import { generateFeedItems } from '@/utils/feedItemGenerator';
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
    console.log('Creating feed with fixed algorithm, shuffle key:', shuffleKey);
    
    const profileItems = generateFeedItems(filteredProfiles, shuffleKey);

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

    // Fixed algorithm: No duplication, just smart ordering
    const combinedItems = [...otherPostItems, ...profileItems];
    
    // Separate admin content from regular content
    const adminItems = combinedItems.filter(item => 
      (item as any).isAdminPost || 
      item.profile.role?.toLowerCase() === 'admin'
    );
    const regularItems = combinedItems.filter(item => 
      !(item as any).isAdminPost && 
      item.profile.role?.toLowerCase() !== 'admin'
    );

    console.log(`Admin items: ${adminItems.length}, Regular items: ${regularItems.length}`);

    // Smart interleaving: Admin content appears frequently but NO DUPLICATION
    const interleavedItems: FeedItem[] = [];
    const shuffledAdmin = shuffleArrayWithSeed(adminItems, shuffleKey);
    const shuffledRegular = shuffleArrayWithSeed(regularItems, shuffleKey + 1);
    
    let adminIndex = 0;
    let regularIndex = 0;
    let position = 0;
    
    // Interleave with admin priority every 3-4 items
    while (adminIndex < shuffledAdmin.length || regularIndex < shuffledRegular.length) {
      // Every 3rd position, try to add admin content
      if (position % 3 === 0 && adminIndex < shuffledAdmin.length) {
        interleavedItems.push(shuffledAdmin[adminIndex]);
        adminIndex++;
      } else if (regularIndex < shuffledRegular.length) {
        interleavedItems.push(shuffledRegular[regularIndex]);
        regularIndex++;
      } else if (adminIndex < shuffledAdmin.length) {
        // Fill remaining admin items
        interleavedItems.push(shuffledAdmin[adminIndex]);
        adminIndex++;
      }
      position++;
    }

    // Prepend user's own posts at the top (if any)
    const result = myPostItems.length > 0
      ? [...myPostItems, ...interleavedItems]
      : interleavedItems;

    console.log(`Final feed composition: ${result.length} items (${myPostItems.length} own posts, no duplicates)`);
    return result;
  }, [filteredProfiles, posts, shuffleKey, userId]);

  return allFeedItems;
};
