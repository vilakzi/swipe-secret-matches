
import { useMemo } from 'react';
import { useUserRole } from './useUserRole';

interface Profile {
  id: number;
  name: string;
  age: number;
  image: string;
  bio: string;
  whatsapp: string;
  location: string;
  gender?: 'male' | 'female';
  userType?: 'user' | 'service_provider';
  serviceCategory?: string;
  portfolio?: string[];
  rating?: number;
  reviewCount?: number;
  isAvailable?: boolean;
  services?: string[];
}

export const useProfileFiltering = (allProfiles: Profile[]) => {
  const { role, isAdmin, isServiceProvider, isUser } = useUserRole();

  const filteredProfiles = useMemo(() => {
    // Admin sees all profiles
    if (isAdmin) {
      return allProfiles;
    }

    // Users see only service provider profiles
    if (isUser) {
      return allProfiles.filter(profile => profile.userType === 'service_provider');
    }

    // Service providers see user profiles
    if (isServiceProvider) {
      return allProfiles.filter(profile => profile.userType === 'user');
    }

    // Default: return empty array for safety
    return [];
  }, [allProfiles, role, isAdmin, isServiceProvider, isUser]);

  return {
    filteredProfiles,
    canSeeAllProfiles: isAdmin,
    canSeeProviders: isUser || isAdmin,
    canSeeUsers: isServiceProvider || isAdmin
  };
};
