
import { useState, useCallback, useMemo } from 'react';
import { FeedItem } from '@/components/feed/types/feedTypes';

interface InfiniteFlowConfig {
  contentQueue: FeedItem[];
  initialLoadSize?: number;
  loadMoreSize?: number;
  onContentSeen?: (itemIds: string[]) => void;
}

export const useInfiniteContentFlow = ({
  contentQueue,
  initialLoadSize = 12,
  loadMoreSize = 8,
  onContentSeen
}: InfiniteFlowConfig) => {
  const [loadedItemsCount, setLoadedItemsCount] = useState(initialLoadSize);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  // Get currently displayed items
  const displayedItems = useMemo(() => {
    const items = contentQueue.slice(0, loadedItemsCount);
    console.log('🌊 Infinite flow displaying:', items.length, 'items');
    return items;
  }, [contentQueue, loadedItemsCount]);

  // Check if more content is available
  const hasMoreContent = useMemo(() => {
    return loadedItemsCount < contentQueue.length;
  }, [loadedItemsCount, contentQueue.length]);

  // Load more content
  const loadMoreContent = useCallback(async () => {
    if (isLoadingMore || !hasMoreContent) return;

    setIsLoadingMore(true);
    
    // Mark current items as seen
    if (onContentSeen) {
      const currentItemIds = displayedItems.map(item => item.id);
      onContentSeen(currentItemIds);
    }

    // Simulate loading delay for smooth UX
    await new Promise(resolve => setTimeout(resolve, 500));

    setLoadedItemsCount(prev => Math.min(prev + loadMoreSize, contentQueue.length));
    setIsLoadingMore(false);

    console.log('🌊 Loaded more content, total items:', Math.min(loadedItemsCount + loadMoreSize, contentQueue.length));
  }, [isLoadingMore, hasMoreContent, onContentSeen, displayedItems, loadMoreSize, loadedItemsCount, contentQueue.length]);

  // Reset flow (for refresh)
  const resetFlow = useCallback(() => {
    setLoadedItemsCount(initialLoadSize);
    setIsLoadingMore(false);
  }, [initialLoadSize]);

  return {
    displayedItems,
    hasMoreContent,
    isLoadingMore,
    loadMoreContent,
    resetFlow,
    totalAvailableItems: contentQueue.length
  };
};
