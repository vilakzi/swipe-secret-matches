
import { useState, useMemo, useCallback } from 'react';
import { demoProfiles, type Profile } from '@/data/demoProfiles';
import { useProfileFiltering } from './useProfileFiltering';

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

  // Use the enhanced profile filtering
  const { filteredProfiles } = useProfileFiltering(demoProfiles);

  // Apply additional gender and name filters
  const finalFilteredProfiles = useMemo(() => {
    let profiles = filteredProfiles;

    // Apply gender filter
    if (filterGender) {
      profiles = profiles.filter(profile => profile.gender === filterGender);
    }

    // Apply name filter
    if (filterName.trim()) {
      profiles = profiles.filter(profile => 
        profile.name.toLowerCase().includes(filterName.toLowerCase().trim())
      );
    }

    return profiles;
  }, [filteredProfiles, filterGender, filterName]);

  // Create all feed items - simplified approach
  const allFeedItems = useMemo(() => {
    const items: FeedItem[] = [];
    
    // Shuffle profiles first to randomize order
    const shuffledProfiles = shuffleArray(finalFilteredProfiles);
    
    // Generate feed items for each profile
    shuffledProfiles.forEach((profile) => {
      // Add profile card
      items.push({
        id: `profile-${profile.id}`,
        type: 'profile',
        profile: profile
      });
      
      // Add posts if they exist
      if (profile.posts && profile.posts.length > 0) {
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
    
    return items;
  }, [finalFilteredProfiles, shuffleKey]);

  // Get items for current page
  const displayedItems = useMemo(() => {
    return allFeedItems.slice(0, currentPage * itemsPerPage);
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
    setFilterGender(gender);
    setCurrentPage(1);
    // Trigger re-shuffle when filter changes
    setShuffleKey(prev => prev + 1);
  }, []);

  const handleNameFilterChange = useCallback((name: string) => {
    setFilterName(name);
    setCurrentPage(1);
    // Trigger re-shuffle when name filter changes
    setShuffleKey(prev => prev + 1);
  }, []);

  const handleRefresh = useCallback(() => {
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
