
import { useMemo } from 'react';
import { useUserRole } from './useUserRole';
import { Profile } from '@/components/feed/types/feedTypes';

export const useFilteredFeedData = (allProfiles: Profile[], newJoiners: any[], posts: any[]) => {
  const { role, isAdmin, isServiceProvider, isUser } = useUserRole();

  const filteredProfiles = useMemo(() => {
    console.log('Feed filtering - role:', role);
    console.log('All profiles count:', allProfiles.length);
    console.log('New joiners count:', newJoiners.length);
    console.log('Posts count:', posts.length);
    
    // Admin sees all profiles
    if (isAdmin) {
      console.log('Admin user - showing all profiles');
      return allProfiles;
    }

    // Regular users see only service providers, new joiners, and users who have posted
    if (isUser) {
      // Get service providers from allProfiles
      const serviceProviders = allProfiles.filter(profile => profile.userType === 'service_provider');
      
      // Get users who have posted content
      const userIdsWithPosts = [...new Set(posts.map(post => post.provider_id))];
      const usersWithPosts = allProfiles.filter(profile => 
        profile.userType === 'user' && userIdsWithPosts.includes(profile.id)
      );
      
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
        isRealAccount: true,
        posts: []
      }));

      const combined = [...serviceProviders, ...usersWithPosts, ...newJoinerProfiles];
      console.log('Regular user - showing service providers, users with posts, and new joiners:', combined.length);
      return combined;
    }

    // Service providers see user profiles who have posted and new joiners (no other service providers)
    if (isServiceProvider) {
      // Get users who have posted content
      const userIdsWithPosts = [...new Set(posts.map(post => post.provider_id))];
      const usersWithPosts = allProfiles.filter(profile => 
        profile.userType === 'user' && userIdsWithPosts.includes(profile.id)
      );
      
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
        isRealAccount: true,
        posts: []
      }));

      const combined = [...usersWithPosts, ...newJoinerProfiles];
      console.log('Service provider - showing users with posts and new joiners:', combined.length);
      return combined;
    }

    // Default: return empty array for safety
    console.log('No valid role - returning empty array');
    return [];
  }, [allProfiles, newJoiners, posts, role, isAdmin, isServiceProvider, isUser]);

  return filteredProfiles;
};
