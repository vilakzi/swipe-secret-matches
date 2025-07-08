
import { useState, useCallback } from 'react';

interface QueuedContent {
  id: string;
  type: 'new_post' | 'new_profile' | 'update';
  data: any;
  timestamp: number;
}

export const useContentQueue = () => {
  const [queue, setQueue] = useState<QueuedContent[]>([]);
  const [showQueueIndicator, setShowQueueIndicator] = useState(false);

  const addToQueue = useCallback((items: any[], type: QueuedContent['type']) => {
    const queuedItems = items.map(item => ({
      id: item.id || `${type}-${Date.now()}-${Math.random()}`,
      type,
      data: item,
      timestamp: Date.now()
    }));

    setQueue(prev => [...queuedItems, ...prev]);
    setShowQueueIndicator(true);
    
    console.log(`📋 Added ${queuedItems.length} items to content queue`);
  }, []);

  const consumeQueue = useCallback(() => {
    const items = [...queue];
    setQueue([]);
    setShowQueueIndicator(false);
    
    console.log(`📋 Consuming ${items.length} items from queue`);
    return items;
  }, [queue]);

  const clearQueue = useCallback(() => {
    setQueue([]);
    setShowQueueIndicator(false);
  }, []);

  return {
    queue,
    queueCount: queue.length,
    showQueueIndicator,
    addToQueue,
    consumeQueue,
    clearQueue
  };
};
