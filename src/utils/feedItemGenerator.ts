
import { shuffleArrayWithSeed } from './feed/shuffleUtils';
import { Profile } from '@/components/feed/types/feedTypes';

// Generate feed items from REAL profiles only - no demo data
export const generateFeedItems = (profiles: Profile[], shuffleKey: number = 0) => {
  console.log(`Generating feed items from ${profiles.length} real profiles (no demo data)`);
  
  // Only use real profiles - no demo profiles
  const realProfiles = profiles.filter(profile => profile.isRealAccount);
  
  // Shuffle real profiles with seed for consistency
  const shuffledProfiles = shuffleArrayWithSeed(realProfiles, shuffleKey);
  
  // Convert to feed items
  const feedItems = shuffledProfiles.map(profile => ({
    id: `profile-${profile.id}`,
    type: 'profile' as const,
    profile: {
      ...profile,
      isRealAccount: true // Ensure all items are marked as real
    }
  }));

  console.log(`Generated ${feedItems.length} feed items from real profiles only`);
  return feedItems;
};
