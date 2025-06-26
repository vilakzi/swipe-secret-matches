
import { useMemo } from 'react';
import { Profile } from '@/components/feed/types/feedTypes';

export const useUniversalFeedData = (allProfiles: Profile[], newJoiners: any[], posts: any[]) => {
  const universalFeedData = useMemo(() => {
    console.log('🌍 Universal Feed - Everyone sees everyone principle');
    console.log('All profiles count:', allProfiles.length);
    console.log('New joiners count:', newJoiners.length);
    console.log('Posts count:', posts.length);
    
    // Convert new joiners to Profile format
    const newJoinerProfiles: Profile[] = newJoiners.map(joiner => ({
      id: joiner.id,
      name: joiner.display_name || 'New User',
      age: joiner.age || 25,
      image: joiner.profile_image_url || '/placeholder.svg',
      bio: joiner.bio || 'New member just joined!',
      whatsapp: joiner.whatsapp || '',
      location: joiner.location || 'Unknown',
      gender: joiner.gender as 'male' | 'female' || 'male',
      userType: joiner.user_type as 'user' | 'service_provider' || 'user',
      role: joiner.role || joiner.user_type,
      isRealAccount: true,
      posts: []
    }));

    // UNIVERSAL PRINCIPLE: Everyone sees content from everyone
    const allAvailableProfiles = [...allProfiles, ...newJoinerProfiles];
    
    console.log('🌍 Universal Feed created:', {
      totalProfiles: allAvailableProfiles.length,
      totalPosts: posts.length,
      principle: 'Everyone sees everyone'
    });

    return {
      profiles: allAvailableProfiles,
      posts,
      newJoiners: newJoinerProfiles
    };
  }, [allProfiles, newJoiners, posts]);

  return universalFeedData;
};
