
import { useState, useEffect, useCallback, useRef } from 'react';
import { FeedItem } from '@/components/feed/types/feedTypes';
import { FeedAlgorithmEngine } from '@/utils/feed/feedAlgorithmEngine';
import { toast } from '@/hooks/use-toast';

interface UseDynamicFeedAlgorithmProps {
  rawFeedItems: FeedItem[];
  enabled?: boolean;
  autoRefreshInterval?: number; // milliseconds
  maxItemsPerLoad?: number;
}

export const useDynamicFeedAlgorithm = ({
  rawFeedItems,
  enabled = true,
  autoRefreshInterval = 180000, // 3 minutes
  maxItemsPerLoad = 8
}: UseDynamicFeedAlgorithmProps) => {
  const [algorithmicFeed, setAlgorithmicFeed] = useState<FeedItem[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [lastRefresh, setLastRefresh] = useState<number>(Date.now());
  const [refreshCount, setRefreshCount] = useState(0);
  
  const algorithmEngineRef = useRef<FeedAlgorithmEngine | null>(null);
  const autoRefreshTimerRef = useRef<NodeJS.Timeout | null>(null);
  const isUserActiveRef = useRef<boolean>(true);

  // Initialize algorithm engine
  useEffect(() => {
    if (!algorithmEngineRef.current) {
      algorithmEngineRef.current = new FeedAlgorithmEngine();
    }
  }, []);

  // Track user activity for intelligent auto-refresh
  useEffect(() => {
    const handleVisibilityChange = () => {
      isUserActiveRef.current = !document.hidden;
      if (isUserActiveRef.current) {
        // User came back - trigger refresh if it's been a while
        const timeSinceRefresh = Date.now() - lastRefresh;
        if (timeSinceRefresh > autoRefreshInterval / 2) {
          processAlgorithmicFeed(true);
        }
      }
    };

    const handleUserActivity = () => {
      isUserActiveRef.current = true;
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    document.addEventListener('mousemove', handleUserActivity);
    document.addEventListener('keydown', handleUserActivity);
    document.addEventListener('scroll', handleUserActivity);
    document.addEventListener('touchstart', handleUserActivity);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      document.removeEventListener('mousemove', handleUserActivity);
      document.removeEventListener('keydown', handleUserActivity);
      document.removeEventListener('scroll', handleUserActivity);
      document.removeEventListener('touchstart', handleUserActivity);
    };
  }, [lastRefresh, autoRefreshInterval]);

  // Process feed through algorithm
  const processAlgorithmicFeed = useCallback(async (isAutoRefresh = false) => {
    if (!enabled || !algorithmEngineRef.current || rawFeedItems.length === 0) {
      return;
    }

    setIsProcessing(true);

    try {
      // Score all content
      const scoredItems = algorithmEngineRef.current.scoreContent(rawFeedItems);
      
      // Rank and apply algorithm
      const rankedItems = algorithmEngineRef.current.rankContent(scoredItems);
      
      // Limit items for performance
      const finalItems = rankedItems.slice(0, maxItemsPerLoad * 2);
      
      setAlgorithmicFeed(finalItems);
      setLastRefresh(Date.now());
      setRefreshCount(prev => prev + 1);

      // Show subtle notification for manual refreshes
      if (!isAutoRefresh) {
        toast({
          title: "Feed refreshed",
          description: "New content prioritized based on engagement",
          duration: 2000,
        });
      }

      console.log(`🚀 Algorithm processed ${finalItems.length} items (refresh #${refreshCount + 1})`);
      
    } catch (error) {
      console.error('Error processing algorithmic feed:', error);
    } finally {
      setIsProcessing(false);
    }
  }, [enabled, rawFeedItems, maxItemsPerLoad, refreshCount]);

  // Auto-refresh timer
  useEffect(() => {
    if (!enabled || autoRefreshInterval <= 0) {
      return;
    }

    // Clear existing timer
    if (autoRefreshTimerRef.current) {
      clearInterval(autoRefreshTimerRef.current);
    }

    // Set up new timer
    autoRefreshTimerRef.current = setInterval(() => {
      if (isUserActiveRef.current) {
        processAlgorithmicFeed(true);
      }
    }, autoRefreshInterval);

    return () => {
      if (autoRefreshTimerRef.current) {
        clearInterval(autoRefreshTimerRef.current);
      }
    };
  }, [enabled, autoRefreshInterval, processAlgorithmicFeed]);

  // Process feed when raw items change
  useEffect(() => {
    processAlgorithmicFeed();
  }, [rawFeedItems, processAlgorithmicFeed]);

  // Manual refresh function
  const manualRefresh = useCallback(() => {
    if (algorithmEngineRef.current) {
      algorithmEngineRef.current.resetSession();
    }
    processAlgorithmicFeed(false);
  }, [processAlgorithmicFeed]);

  // Get algorithm stats
  const getAlgorithmStats = useCallback(() => {
    return algorithmEngineRef.current?.getSessionStats() || null;
  }, []);

  return {
    algorithmicFeed,
    isProcessing,
    lastRefresh,
    refreshCount,
    manualRefresh,
    getAlgorithmStats
  };
};
