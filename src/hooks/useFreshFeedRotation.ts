
import { useState, useCallback, useRef } from 'react';
import { FeedItem } from '@/components/feed/types/feedTypes';

interface UseFreshFeedRotationProps {
  allFeedItems: FeedItem[];
  batchSize?: number;
}

export const useFreshFeedRotation = ({
  allFeedItems,
  batchSize = 25
}: UseFreshFeedRotationProps) => {
  const [currentBatch, setCurrentBatch] = useState<FeedItem[]>([]);
  const [viewedItems, setViewedItems] = useState<Set<string>>(new Set());
  const rotationIndexRef = useRef(0);
  const lastRefreshRef = useRef<number>(Date.now());

  const generateFreshBatch = useCallback(() => {
    console.log('🔄 Generating fresh batch with content rotation...');
    
    const now = Date.now();
    const timeSinceLastRefresh = now - lastRefreshRef.current;
    
    // If it's been more than 30 seconds or we have new items, ensure fresh content
    const shouldForceNewContent = timeSinceLastRefresh > 30000;
    
    if (allFeedItems.length === 0) {
      return [];
    }

    // Separate viewed and unviewed items
    const unviewedItems = allFeedItems.filter(item => !viewedItems.has(item.id));
    const viewedItems = allFeedItems.filter(item => viewedItems.has(item.id));
    
    let freshBatch: FeedItem[] = [];
    
    if (unviewedItems.length >= batchSize) {
      // Plenty of unviewed content
      freshBatch = unviewedItems.slice(0, batchSize);
    } else if (unviewedItems.length > 0) {
      // Mix unviewed with some viewed content
      const remainingSlots = batchSize - unviewedItems.length;
      const rotatedViewed = viewedItems.slice(rotationIndexRef.current % viewedItems.length);
      
      freshBatch = [
        ...unviewedItems,
        ...rotatedViewed.slice(0, remainingSlots)
      ];
      
      // Update rotation index for next time
      rotationIndexRef.current = (rotationIndexRef.current + remainingSlots) % Math.max(viewedItems.length, 1);
    } else {
      // All content has been viewed, rotate through everything
      const startIndex = rotationIndexRef.current % allFeedItems.length;
      freshBatch = [
        ...allFeedItems.slice(startIndex, startIndex + batchSize),
        ...allFeedItems.slice(0, Math.max(0, startIndex + batchSize - allFeedItems.length))
      ];
      
      rotationIndexRef.current = (rotationIndexRef.current + batchSize) % allFeedItems.length;
      
      // Reset viewed items occasionally for variety
      if (shouldForceNewContent) {
        setViewedItems(new Set());
        console.log('🔄 Reset viewed items for fresh experience');
      }
    }

    // Shuffle the batch for variety
    for (let i = freshBatch.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [freshBatch[i], freshBatch[j]] = [freshBatch[j], freshBatch[i]];
    }

    lastRefreshRef.current = now;
    setCurrentBatch(freshBatch);
    
    console.log(`🔄 Fresh batch generated: ${freshBatch.length} items (${unviewedItems.length} unviewed, ${viewedItems.length} viewed)`);
    
    return freshBatch;
  }, [allFeedItems, batchSize, viewedItems]);

  const markAsViewed = useCallback((itemId: string) => {
    setViewedItems(prev => new Set([...prev, itemId]));
  }, []);

  const resetRotation = useCallback(() => {
    console.log('🔄 Resetting feed rotation completely');
    setViewedItems(new Set());
    rotationIndexRef.current = 0;
    lastRefreshRef.current = Date.now();
    return generateFreshBatch();
  }, [generateFreshBatch]);

  return {
    currentBatch,
    generateFreshBatch,
    markAsViewed,
    resetRotation,
    viewedCount: viewedItems.size,
    totalCount: allFeedItems.length
  };
};
