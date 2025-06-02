
import { useState, useMemo, useCallback } from 'react';
import { demoProfiles, type Profile } from '@/data/demoProfiles';

export interface FeedItem {
  id: string;
  type: 'profile' | 'post';
  profile: Profile;
  postImage?: string;
  caption?: string;
}

// Fisher-Yates shuffle algorithm for randomizing array order
const shuffleArray = <T>(array: T[]): T[] => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

export const useFeedData = (itemsPerPage: number = 6) => {
  const [filterGender, setFilterGender] = useState<'male' | 'female' | null>(null);
  const [filterName, setFilterName] = useState<string>('');
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [shuffleKey, setShuffleKey] = useState(0);

  console.log('Total demo profiles:', demoProfiles.length);
  console.log('Filter gender:', filterGender);
  console.log('Filter name:', filterName);

  // Apply gender and name filters directly to all demo profiles
  const filteredProfiles = useMemo(() => {
    let profiles = demoProfiles;

    console.log('Starting with all profiles:', profiles.length);

    // Apply gender filter
    if (filterGender) {
      profiles = profiles.filter(profile => profile.gender === filterGender);
      console.log('After gender filter:', profiles.length);
    }

    // Apply name filter
    if (filterName.trim()) {
      profiles = profiles.filter(profile => 
        profile.name.toLowerCase().includes(filterName.toLowerCase().trim())
      );
      console.log('After name filter:', profiles.length);
    }

    console.log('Final filtered profiles:', profiles.length);
    return profiles;
  }, [filterGender, filterName]);

  // Create all feed items
  const allFeedItems = useMemo(() => {
    const items: FeedItem[] = [];
    
    console.log('Creating feed items from profiles:', filteredProfiles.length);
    
    // Shuffle profiles first to randomize order
    const shuffledProfiles = shuffleArray(filteredProfiles);
    
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
    
    console.log('Total feed items created:', items.length);
    return items;
  }, [filteredProfiles, shuffleKey]);

  // Get items for current page
  const displayedItems = useMemo(() => {
    const items = allFeedItems.slice(0, currentPage * itemsPerPage);
    console.log('Displayed items:', items.length, 'for page:', currentPage);
    return items;
  }, [allFeedItems, currentPage, itemsPerPage]);

  const hasMoreItems = displayedItems.length < allFeedItems.length;

  const handleLoadMore = useCallback(() => {
    if (isLoadingMore || !hasMoreItems) return;
    
    setIsLoadingMore(true);
    // Simulate loading delay
    setTimeout(() => {
      setCurrentPage(prev => prev + 1);
      setIsLoadingMore(false);
    }, 800);
  }, [isLoadingMore, hasMoreItems]);

  // Reset pagination when filter changes
  const handleFilterChange = useCallback((gender: 'male' | 'female' | null) => {
    console.log('Filter change - gender:', gender);
    setFilterGender(gender);
    setCurrentPage(1);
    // Trigger re-shuffle when filter changes
    setShuffleKey(prev => prev + 1);
  }, []);

  const handleNameFilterChange = useCallback((name: string) => {
    console.log('Filter change - name:', name);
    setFilterName(name);
    setCurrentPage(1);
    // Trigger re-shuffle when name filter changes
    setShuffleKey(prev => prev + 1);
  }, []);

  const handleRefresh = useCallback(() => {
    console.log('Refreshing feed');
    setCurrentPage(1);
    // Trigger re-shuffle on refresh for dynamic order
    setShuffleKey(prev => prev + 1);
  }, []);

  return {
    displayedItems,
    hasMoreItems,
    isLoadingMore,
    filterGender,
    filterName,
    handleLoadMore,
    handleFilterChange,
    handleNameFilterChange,
    handleRefresh
  };
};
