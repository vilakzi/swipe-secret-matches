
import { Profile } from '@/data/demoProfiles';

export interface FeedItem {
  id: string;
  type: 'profile' | 'post';
  profile: Profile;
  postImage?: string;
  caption?: string;
}

// Fisher-Yates shuffle algorithm for randomizing array order
export const shuffleArray = <T>(array: T[]): T[] => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

export const generateFeedItems = (profiles: Profile[], shuffleKey: number): FeedItem[] => {
  const items: FeedItem[] = [];
  
  console.log('Creating feed items from real profiles:', profiles.length);
  
  // Shuffle profiles first to randomize order
  const shuffledProfiles = shuffleArray(profiles);
  
  // Generate feed items for each profile
  shuffledProfiles.forEach((profile, index) => {
    console.log(`Processing profile ${index + 1}:`, profile.name);
    
    // Add profile card
    items.push({
      id: `profile-${profile.id}`,
      type: 'profile',
      profile: profile
    });
    
    // Add posts if they exist
    if (profile.posts && profile.posts.length > 0) {
      console.log(`Adding ${profile.posts.length} posts for ${profile.name}`);
      profile.posts.forEach((postImage, postIndex) => {
        items.push({
          id: `post-${profile.id}-${postIndex}`,
          type: 'post',
          profile: profile,
          postImage: postImage,
          caption: profile.userType === 'service_provider' 
            ? `Professional services showcase 💼` 
            : `Feeling good tonight 💫`
        });
      });
    }
  });
  
  console.log('Total feed items created from real accounts:', items.length);
  return items;
};
