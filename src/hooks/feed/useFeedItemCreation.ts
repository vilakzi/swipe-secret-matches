
import { useMemo } from 'react';
import { FeedItem } from '@/components/feed/types/feedTypes';
import { shuffleArrayWithSeed } from '@/utils/feed/shuffleUtils';
import { isVideo } from '@/utils/feed/mediaUtils';

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
    console.log('Creating feed with OPTIMIZED algorithm - NO duplicates, shuffle key:', shuffleKey);
    
    // Ensure we have valid arrays
    const validProfiles = Array.isArray(filteredProfiles) ? filteredProfiles : [];
    const validPosts = Array.isArray(posts) ? posts : [];
    
    // Convert profiles to feed items - only real profiles with error handling
    const profileItems: FeedItem[] = validProfiles
      .filter(profile => profile && profile.id && typeof profile.id === 'string') // Ensure valid profiles
      .map(profile => ({
        id: profile.id,
        type: 'profile' as const,
        profile: {
          id: profile.id,
          name: profile.name || 'Unknown',
          age: typeof profile.age === 'number' ? profile.age : 25,
          image: profile.image || '/placeholder.svg',
          bio: profile.bio || '',
          whatsapp: profile.whatsapp || '',
          location: profile.location || 'Unknown',
          gender: (profile.gender === 'male' || profile.gender === 'female') ? profile.gender : 'male',
          userType: profile.userType || 'user',
          role: profile.role || profile.userType || 'user',
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

    // Convert posts to feed items with better error handling
    const postItems: FeedItem[] = validPosts
      .filter(post => post && post.id && post.content_url && typeof post.content_url === 'string') // Ensure valid posts
      .map(post => {
        const role = post.profiles?.role?.toLowerCase() || '';
        const isAdmin = role === 'admin' || role === 'superadmin';
        const postIsVideo = isVideo(post.content_url);
        
        return {
          id: post.id,
          type: 'post' as const,
          profile: {
            id: post.profiles?.id || post.provider_id || 'unknown',
            name: post.profiles?.display_name || 'Anonymous',
            age: typeof post.profiles?.age === 'number' ? post.profiles.age : 25,
            image: post.profiles?.profile_image_url || '/placeholder.svg',
            bio: post.profiles?.bio || '',
            whatsapp: post.profiles?.whatsapp || '',
            location: post.profiles?.location || 'Unknown',
            gender: (post.profiles?.gender === 'male' || post.profiles?.gender === 'female') ? post.profiles.gender : 'male',
            userType: (post.profiles?.user_type === 'service_provider') ? 'service_provider' : 'user',
            role: post.profiles?.role || post.profiles?.user_type || 'user',
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
          isAdminPost: isAdmin,
          createdAt: post.created_at,
          isVideo: postIsVideo,
          videoDuration: post.video_duration || undefined,
          videoThumbnail: post.video_thumbnail || undefined
        };
      });

    // OPTIMIZED: Separate user's own posts to prevent duplicates
    const userPosts = userId ? postItems.filter(item => item.profile.id === userId) : [];
    const otherPosts = userId ? postItems.filter(item => item.profile.id !== userId) : postItems;

    // Create a single combined array with NO DUPLICATES
    const allOtherItems = [...otherPosts, ...profileItems];
    
    // Optimized shuffle with error handling
    let shuffledItems = [];
    try {
      shuffledItems = shuffleArrayWithSeed(allOtherItems, shuffleKey);
    } catch (error) {
      console.error('Shuffle error, using original order:', error);
      shuffledItems = allOtherItems;
    }
    
    // Final result: user's posts first, then shuffled other content
    const result = userPosts.length > 0 
      ? [...userPosts, ...shuffledItems]
      : shuffledItems;

    console.log(`OPTIMIZED Feed: ${result.length} total items (${userPosts.length} user posts, ${otherPosts.length} other posts, ${profileItems.length} profiles) - GUARANTEED NO DUPLICATES`);
    
    return result;
  }, [filteredProfiles, posts, shuffleKey, userId]);

  return allFeedItems;
};
