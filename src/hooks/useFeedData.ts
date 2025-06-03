
import { useState, useMemo, useCallback } from 'react';
import { demoProfiles } from '@/data/demoProfiles';
import { useRealProfiles } from './useRealProfiles';
import { useProfileFilters } from './useProfileFilters';
import { useFeedPagination } from './useFeedPagination';
import { generateFeedItems, type FeedItem } from '@/utils/feedItemGenerator';

export type { FeedItem };

export const useFeedData = (itemsPerPage: number = 6) => {
  const [filterGender, setFilterGender] = useState<'male' | 'female' | null>(null);
  const [filterName, setFilterName] = useState<string>('');
  const [shuffleKey, setShuffleKey] = useState(0);
  
  const { realProfiles, loading } = useRealProfiles();

  // Combine real profiles with demo profiles
  const allProfiles = useMemo(() => {
    // Mark demo profiles as not real accounts
    const demoProfilesWithFlag = demoProfiles.map(profile => ({
      ...profile,
      isRealAccount: false
    }));
    
    const combined = [...realProfiles, ...demoProfilesWithFlag];
    console.log(`Total profiles: ${combined.length} (${realProfiles.length} real + ${demoProfiles.length} demo)`);
    return combined;
  }, [realProfiles]);

  console.log('Total combined profiles:', allProfiles.length);
  console.log('Filter gender:', filterGender);
  console.log('Filter name:', filterName);

  // Apply filters
  const filteredProfiles = useProfileFilters(allProfiles, filterGender, filterName);

  // Create all feed items
  const allFeedItems = useMemo(() => {
    return generateFeedItems(filteredProfiles, shuffleKey);
  }, [filteredProfiles, shuffleKey]);

  // Handle pagination
  const {
    displayedItems,
    hasMoreItems,
    isLoadingMore: paginationLoading,
    handleLoadMore,
    resetPagination
  } = useFeedPagination(allFeedItems, itemsPerPage);

  const isLoadingMore = paginationLoading || loading;

  // Reset pagination when filter changes
  const handleFilterChange = useCallback((gender: 'male' | 'female' | null) => {
    console.log('Filter change - gender:', gender);
    setFilterGender(gender);
    resetPagination();
    // Trigger re-shuffle when filter changes
    setShuffleKey(prev => prev + 1);
  }, [resetPagination]);

  const handleNameFilterChange = useCallback((name: string) => {
    console.log('Filter change - name:', name);
    setFilterName(name);
    resetPagination();
    // Trigger re-shuffle when name filter changes
    setShuffleKey(prev => prev + 1);
  }, [resetPagination]);

  const handleRefresh = useCallback(() => {
    console.log('Refreshing feed');
    resetPagination();
    // Trigger re-shuffle on refresh for dynamic order
    setShuffleKey(prev => prev + 1);
  }, [resetPagination]);

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
