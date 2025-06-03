
import { useMemo } from 'react';
import { Profile } from '@/data/demoProfiles';

export const useProfileFilters = (
  profiles: Profile[],
  filterGender: 'male' | 'female' | null,
  filterName: string
) => {
  return useMemo(() => {
    let filteredProfiles = profiles;

    console.log('Starting with all profiles:', filteredProfiles.length);

    // Apply gender filter
    if (filterGender) {
      filteredProfiles = filteredProfiles.filter(profile => profile.gender === filterGender);
      console.log('After gender filter:', filteredProfiles.length);
    }

    // Apply name filter
    if (filterName.trim()) {
      filteredProfiles = filteredProfiles.filter(profile => 
        profile.name.toLowerCase().includes(filterName.toLowerCase().trim())
      );
      console.log('After name filter:', filteredProfiles.length);
    }

    console.log('Final filtered profiles:', filteredProfiles.length);
    return filteredProfiles;
  }, [profiles, filterGender, filterName]);
};
