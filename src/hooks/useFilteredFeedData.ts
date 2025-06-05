
import { useMemo } from 'react';
import { useUserRole } from './useUserRole';
import { Profile } from '@/data/demoProfiles';

export const useFilteredFeedData = (allProfiles: Profile[], newJoiners: any[]) => {
  const { role, isAdmin, isServiceProvider, isUser } = useUserRole();

  const filteredProfiles = useMemo(() => {
    console.log('Feed filtering - role:', role);
    console.log('All profiles count:', allProfiles.length);
    console.log('New joiners count:', newJoiners.length);
    
    // Admin sees all profiles
    if (isAdmin) {
      console.log('Admin user - showing all profiles');
      return allProfiles;
    }

    // Regular users see only service providers and new joiners
    if (isUser) {
      // Get service providers from allProfiles
      const serviceProviders = allProfiles.filter(profile => profile.userType === 'service_provider');
      
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

      const combined = [...serviceProviders, ...newJoinerProfiles];
      console.log('Regular user - showing service providers and new joiners:', combined.length);
      return combined;
    }

    // Service providers see user profiles and new joiners (no other service providers)
    if (isServiceProvider) {
      const users = allProfiles.filter(profile => profile.userType === 'user');
      
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

      const combined = [...users, ...newJoinerProfiles];
      console.log('Service provider - showing users and new joiners:', combined.length);
      return combined;
    }

    // Default: return empty array for safety
    console.log('No valid role - returning empty array');
    return [];
  }, [allProfiles, newJoiners, role, isAdmin, isServiceProvider, isUser]);

  return filteredProfiles;
};
