
import { useMemo } from 'react';
import { Profile } from '@/components/feed/types/feedTypes';

// UPDATED: Universal feed access - everyone sees everyone's content
export const useFilteredFeedData = (allProfiles: Profile[], newJoiners: any[], posts: any[]) => {
  const universalProfiles = useMemo(() => {
    console.log('🌍 UNIVERSAL FEED - Everyone sees everyone principle active');
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

    // UNIVERSAL ACCESS: Return ALL profiles for ALL users
    const combinedProfiles = [...allProfiles, ...newJoinerProfiles];
    
    console.log('🌍 Universal feed created with', combinedProfiles.length, 'total profiles');
    console.log('🌍 Content visibility: EVERYONE SEES EVERYONE');
    
    return combinedProfiles;
  }, [allProfiles, newJoiners, posts]);

  return universalProfiles;
};
