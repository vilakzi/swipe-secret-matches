
import { useMemo } from 'react';
import { useUserRole } from './useUserRole';
import { useEnhancedAuth } from '@/contexts/EnhancedAuthContext';
import { Profile } from '@/components/feed/types/feedTypes';

export const useProfileFiltering = (allProfiles: Profile[]) => {
  const { role, isAdmin, isServiceProvider, isUser } = useUserRole();
  const { user } = useEnhancedAuth();

  const filteredProfiles = useMemo(() => {
    console.log('Profile filtering - role:', role, 'user:', user?.id);
    console.log('All profiles count:', allProfiles.length);
    
    // Admin sees all profiles
    if (isAdmin) {
      console.log('Admin user - showing all profiles');
      return allProfiles;
    }

    // Users see only service provider profiles
    if (isUser) {
      const serviceProviders = allProfiles.filter(profile => profile.userType === 'service_provider');
      console.log('Regular user - showing service providers only:', serviceProviders.length);
      return serviceProviders;
    }

    // Service providers see user profiles AND their own profile
    if (isServiceProvider) {
      const visibleProfiles = allProfiles.filter(profile => 
        profile.userType === 'user' || 
        (profile.userType === 'service_provider' && profile.id.toString() === user?.id)
      );
      console.log('Service provider - showing users + own profile:', visibleProfiles.length);
      return visibleProfiles;
    }

    // Default: return empty array for safety
    console.log('No valid role - returning empty array');
    return [];
  }, [allProfiles, role, isAdmin, isServiceProvider, isUser, user?.id]);

  return {
    filteredProfiles,
    canSeeAllProfiles: isAdmin,
    canSeeProviders: isUser || isAdmin,
    canSeeUsers: isServiceProvider || isAdmin,
    canSeeOwnPosts: isServiceProvider
  };
};
