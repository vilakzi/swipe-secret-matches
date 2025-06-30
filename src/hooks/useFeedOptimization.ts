
import { useMemo, useCallback } from 'react';
import { FeedItem } from '@/components/feed/types/feedTypes';

interface OptimizedFeedData {
  items: FeedItem[];
  totalCount: number;
  hasNewContent: boolean;
}

export const useFeedOptimization = (feedItems: FeedItem[]) => {
  // Memoize heavy computations
  const optimizedData = useMemo((): OptimizedFeedData => {
    console.log('🚀 Optimizing feed data...');
    
    // Remove duplicates based on ID
    const uniqueItems = feedItems.filter((item, index, self) => 
      index === self.findIndex(t => t.id === item.id)
    );

    // Sort by creation date (most recent first)
    const sortedItems = uniqueItems.sort((a, b) => {
      const dateA = new Date(a.createdAt || a.timestamp || 0).getTime();
      const dateB = new Date(b.createdAt || b.timestamp || 0).getTime();
      return dateB - dateA;
    });

    return {
      items: sortedItems,
      totalCount: sortedItems.length,
      hasNewContent: sortedItems.length > 0
    };
  }, [feedItems]);

  // Memoized filter function
  const filterItems = useCallback((
    items: FeedItem[], 
    filterType: string, 
    locationFilter: string
  ) => {
    return items.filter(item => {
      // Apply type filter
      if (filterType !== 'all') {
        switch (filterType) {
          case 'posts':
            if (item.type !== 'post') return false;
            break;
          case 'profiles':
            if (item.type !== 'profile') return false;
            break;
          case 'admin':
            if (!item.isAdminCard && !item.isContent) return false;
            break;
          case 'welcome':
            if (!item.isWelcome) return false;
            break;
        }
      }

      // Apply location filter
      if (locationFilter !== 'all') {
        // Check admin content location metadata
        if (item.locationMetadata?.target_locations) {
          return item.locationMetadata.target_locations.includes(locationFilter) ||
                 item.locationMetadata.target_locations.includes('all');
        }

        // Check profile location
        const location = item.profile?.location?.toLowerCase() || '';
        switch (locationFilter) {
          case 'soweto':
            return location.includes('soweto');
          case 'jhb-central':
            return location.includes('johannesburg') || location.includes('jhb') || location.includes('central');
          case 'pta':
            return location.includes('pretoria') || location.includes('pta');
          default:
            return true;
        }
      }

      return true;
    });
  }, []);

  return {
    optimizedData,
    filterItems,
  };
};
