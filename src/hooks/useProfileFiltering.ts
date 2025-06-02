
import { useMemo } from 'react';
import { useUserRole } from './useUserRole';
import { useAuth } from '@/contexts/AuthContext';
import { Profile } from '@/data/demoProfiles';

export const useProfileFiltering = (allProfiles: Profile[]) => {
  const { role, isAdmin, isServiceProvider, isUser } = useUserRole();
  const { user } = useAuth();

  const filteredProfiles = useMemo(() => {
    // Admin sees all profiles
    if (isAdmin) {
      return allProfiles;
    }

    // Users see only service provider profiles
    if (isUser) {
      return allProfiles.filter(profile => profile.userType === 'service_provider');
    }

    // Service providers see user profiles AND their own profile
    if (isServiceProvider) {
      return allProfiles.filter(profile => 
        profile.userType === 'user' || 
        (profile.userType === 'service_provider' && profile.id.toString() === user?.id)
      );
    }

    // Default: return empty array for safety
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
