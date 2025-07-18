import { useState, useCallback, useRef } from 'react';
import { FeedItem } from '@/components/feed/types/feedTypes';

interface QueuedContent {
  items: FeedItem[];
  timestamp: number;
  type: 'new_post' | 'profile_update' | 'new_profile';
}

interface UseContentQueueOptions {
  maxQueueSize?: number;
  batchDelay?: number;
}

export const useContentQueue = (options: UseContentQueueOptions = {}) => {
  const { maxQueueSize = 50, batchDelay = 2000 } = options;
  
  const [queuedContent, setQueuedContent] = useState<QueuedContent[]>([]);
  const [queueCount, setQueueCount] = useState(0);
  const [showQueueIndicator, setShowQueueIndicator] = useState(false);
  
  const batchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const addToQueue = useCallback((items: FeedItem[], type: QueuedContent['type'] = 'new_post') => {
    const newQueueItem: QueuedContent = {
      items,
      timestamp: Date.now(),
      type
    };

    setQueuedContent(prev => {
      const updated = [...prev, newQueueItem];
      // Keep only the most recent items if queue gets too large
      if (updated.length > maxQueueSize) {
        return updated.slice(-maxQueueSize);
      }
      return updated;
    });

    setQueueCount(prev => prev + items.length);
    setShowQueueIndicator(true);

    // Clear existing batch timeout
    if (batchTimeoutRef.current) {
      clearTimeout(batchTimeoutRef.current);
    }

    // Batch multiple rapid updates
    batchTimeoutRef.current = setTimeout(() => {
      console.log(`📬 Content queued: ${items.length} new items`);
    }, batchDelay);
  }, [maxQueueSize, batchDelay]);

  const consumeQueue = useCallback(() => {
    const allQueuedItems = queuedContent.flatMap(q => q.items);
    
    // Clear the queue
    setQueuedContent([]);
    setQueueCount(0);
    setShowQueueIndicator(false);
    
    console.log(`📬 Consuming queue: ${allQueuedItems.length} items`);
    return allQueuedItems;
  }, [queuedContent]);

  const clearQueue = useCallback(() => {
    setQueuedContent([]);
    setQueueCount(0);
    setShowQueueIndicator(false);
    
    if (batchTimeoutRef.current) {
      clearTimeout(batchTimeoutRef.current);
    }
  }, []);

  const getQueueSummary = useCallback(() => {
    const summary = queuedContent.reduce((acc, item) => {
      acc[item.type] = (acc[item.type] || 0) + item.items.length;
      return acc;
    }, {} as Record<string, number>);

    return {
      total: queueCount,
      byType: summary,
      hasContent: queueCount > 0
    };
  }, [queuedContent, queueCount]);

  return {
    queueCount,
    showQueueIndicator,
    addToQueue,
    consumeQueue,
    clearQueue,
    getQueueSummary,
    hasQueuedContent: queueCount > 0
  };
};
