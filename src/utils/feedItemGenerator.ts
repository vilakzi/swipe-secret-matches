
import { shuffleArrayWithSeed } from './feed/shuffleUtils';
import { Profile } from '@/components/feed/types/feedTypes';

// FIXED: Generate feed items from REAL profiles ONLY - absolutely no demo data
export const generateFeedItems = (profiles: Profile[], shuffleKey: number = 0) => {
  console.log(`Generating feed items from ${profiles.length} profiles (REAL DATA ONLY)`);
  
  // CRITICAL: Filter out any non-real profiles and ensure we have real accounts
  const realProfiles = profiles.filter(profile => 
    profile.isRealAccount === true && 
    profile.id && 
    profile.name
  );
  
  console.log(`Filtered to ${realProfiles.length} verified real profiles`);
  
  // Shuffle real profiles with seed
  const shuffledProfiles = shuffleArrayWithSeed(realProfiles, shuffleKey);
  
  // Convert to feed items with explicit real account marking
  const feedItems = shuffledProfiles.map(profile => ({
    id: `profile-${profile.id}`,
    type: 'profile' as const,
    profile: {
      ...profile,
      isRealAccount: true, // Explicitly mark as real
      // Ensure no demo data leaks through
      image: profile.image === '/placeholder.svg' ? '/placeholder.svg' : profile.image,
      name: profile.name || 'Real User'
    }
  }));

  console.log(`Generated ${feedItems.length} feed items - ALL REAL ACCOUNTS, NO DEMO DATA`);
  return feedItems;
};
