
import { useState, useMemo, useCallback } from 'react';
import { FeedItem } from '@/components/feed/types/feedTypes';

export const useFeedPagination = (allFeedItems: FeedItem[], itemsPerPage: number) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

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

  const resetPagination = useCallback(() => {
    setCurrentPage(1);
  }, []);

  return {
    displayedItems,
    hasMoreItems,
    isLoadingMore,
    handleLoadMore,
    resetPagination
  };
};
