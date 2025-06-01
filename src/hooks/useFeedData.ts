
import { useState, useMemo, useCallback } from 'react';
import { demoProfiles, type Profile } from '@/data/demoProfiles';

export interface FeedItem {
  id: string;
  type: 'profile' | 'post';
  profile: Profile;
  postImage?: string;
  caption?: string;
}

export const useFeedData = (itemsPerPage: number = 6) => {
  const [filterGender, setFilterGender] = useState<'male' | 'female' | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  // Apply role-based filtering
  const filteredProfiles = useMemo(() => {
    let profiles = demoProfiles;

    // Apply gender filter
    if (filterGender) {
      profiles = profiles.filter(profile => profile.gender === filterGender);
    }

    return profiles;
  }, [filterGender]);

  // Create all feed items
  const allFeedItems = useMemo(() => {
    const items: FeedItem[] = [];
    
    filteredProfiles.forEach((profile) => {
      // Add profile card
      items.push({
        id: `profile-${profile.id}`,
        type: 'profile',
        profile: profile
      });
      
      // Add posts for this profile
      if (profile.posts && profile.posts.length > 0) {
        profile.posts.forEach((postImage, postIndex) => {
          items.push({
            id: `post-${profile.id}-${postIndex}`,
            type: 'post',
            profile: profile,
            postImage: postImage,
            caption: `Feeling good tonight 💫`
          });
        });
      }
    });
    
    return items;
  }, [filteredProfiles]);

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
  }, []);

  const handleRefresh = useCallback(() => {
    setCurrentPage(1);
  }, []);

  return {
    displayedItems,
    hasMoreItems,
    isLoadingMore,
    filterGender,
    handleLoadMore,
    handleFilterChange,
    handleRefresh
  };
};
