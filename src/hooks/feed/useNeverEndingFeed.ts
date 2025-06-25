import { useState, useCallback, useMemo } from 'react';
import { FeedItem } from '@/components/feed/types/feedTypes';

interface NeverEndingFeedConfig {
  dynamicContentPool: FeedItem[];
  initialBatchSize?: number;
  loadMoreSize?: number;
  onContentViewed?: (itemIds: string[]) => void;
}

export const useNeverEndingFeed = ({
  dynamicContentPool,
  initialBatchSize = 20,
  loadMoreSize = 15,
  onContentViewed
}: NeverEndingFeedConfig) => {
  const [displayedCount, setDisplayedCount] = useState(initialBatchSize);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  // Current displayed items with intelligent cycling - FIXED ID handling
  const displayedItems = useMemo(() => {
    if (dynamicContentPool.length === 0) return [];

    // If we need more items than available, cycle through the pool
    const neededItems = Math.min(displayedCount, dynamicContentPool.length * 3); // Allow 3x cycling
    const items: FeedItem[] = [];
    
    for (let i = 0; i < neededItems; i++) {
      const poolIndex = i % dynamicContentPool.length;
      const originalItem = dynamicContentPool[poolIndex];
      
      // Add cycle information but keep original ID for database operations
      const cycleNumber = Math.floor(i / dynamicContentPool.length);
      items.push({
        ...originalItem,
        // Keep original ID intact for database operations
        id: originalItem.id,
        displayIndex: i,
        cycleNumber,
        originalId: originalItem.id,
        // Use display key for React rendering to avoid key conflicts
        displayKey: `${originalItem.id}-cycle-${cycleNumber}`
      });
    }

    console.log(`📱 Never-ending feed displaying ${items.length} items (${dynamicContentPool.length} unique, cycling enabled)`);
    
    return items;
  }, [dynamicContentPool, displayedCount]);

  // Always has more content (infinite scroll)
  const hasMoreContent = true;

  // Load more content
  const loadMoreContent = useCallback(async () => {
    if (isLoadingMore || dynamicContentPool.length === 0) return;

    setIsLoadingMore(true);
    
    // Mark current items as viewed using original IDs
    if (onContentViewed) {
      const viewedIds = displayedItems.map(item => item.originalId || item.id);
      onContentViewed(viewedIds);
    }

    // Simulate loading for smooth UX
    await new Promise(resolve => setTimeout(resolve, 300));

    setDisplayedCount(prev => prev + loadMoreSize);
    setIsLoadingMore(false);

    console.log(`📱 Loaded more content, now showing ${displayedCount + loadMoreSize} items`);
  }, [isLoadingMore, dynamicContentPool.length, onContentViewed, displayedItems, loadMoreSize, displayedCount]);

  // Reset feed (for refresh)
  const resetFeed = useCallback(() => {
    console.log('📱 Resetting never-ending feed');
    setDisplayedCount(initialBatchSize);
    setIsLoadingMore(false);
  }, [initialBatchSize]);

  return {
    displayedItems,
    hasMoreContent,
    isLoadingMore,
    loadMoreContent,
    resetFeed,
    feedStats: {
      displayedCount,
      poolSize: dynamicContentPool.length,
      canCycle: dynamicContentPool.length > 0
    }
  };
};
