
import { useState, useEffect, useCallback, useMemo } from 'react';
import { FeedItem } from '@/components/feed/types/feedTypes';

interface UseDynamicFeedAlgorithmProps {
  rawFeedItems: FeedItem[];
  enabled?: boolean;
  autoRefreshInterval?: number;
  maxItemsPerLoad?: number;
}

export const useDynamicFeedAlgorithm = ({
  rawFeedItems,
  enabled = true,
  autoRefreshInterval = 180000,
  maxItemsPerLoad = 24
}: UseDynamicFeedAlgorithmProps) => {
  const [refreshCount, setRefreshCount] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);

  // Simple algorithm that preserves all items but adds intelligent sorting
  const algorithmicFeed = useMemo(() => {
    if (!enabled || rawFeedItems.length === 0) {
      console.log('🚀 Algorithm disabled or no items, returning empty array');
      return [];
    }

    setIsProcessing(true);
    console.log(`🚀 Algorithm processing ${rawFeedItems.length} items (refresh #${refreshCount + 1})`);

    try {
      // Enhanced sorting with admin priority and content mixing
      const processedItems = [...rawFeedItems].map((item, index) => ({
        ...item,
        algorithmScore: calculateItemScore(item, index),
        originalIndex: index
      }));

      // Sort by algorithm score (higher is better)
      const sortedItems = processedItems.sort((a, b) => {
        // Admin posts get highest priority
        if (a.isAdminPost && !b.isAdminPost) return -1;
        if (!a.isAdminPost && b.isAdminPost) return 1;
        
        // Then by algorithm score
        if (b.algorithmScore !== a.algorithmScore) {
          return b.algorithmScore - a.algorithmScore;
        }
        
        // Finally by original order
        return a.originalIndex - b.originalIndex;
      });

      // Limit items but ensure we return content
      const finalItems = sortedItems.slice(0, maxItemsPerLoad).map(({ algorithmScore, originalIndex, ...item }) => item);
      
      console.log(`🚀 Algorithm processed ${finalItems.length} items (refresh #${refreshCount + 1})`);
      
      return finalItems;
    } catch (error) {
      console.error('🚀 Algorithm error:', error);
      // Fallback: return original items to ensure content is visible
      return rawFeedItems.slice(0, maxItemsPerLoad);
    } finally {
      setIsProcessing(false);
    }
  }, [rawFeedItems, enabled, maxItemsPerLoad, refreshCount]);

  // Calculate item relevance score
  const calculateItemScore = (item: FeedItem, index: number): number => {
    let score = 100; // Base score

    // Admin content gets massive boost
    if (item.isAdminPost || item.profile?.role === 'admin') {
      score += 1000;
    }

    // Recent posts get priority
    if (item.createdAt) {
      const ageInHours = (Date.now() - new Date(item.createdAt).getTime()) / (1000 * 60 * 60);
      score += Math.max(0, 50 - ageInHours); // Newer posts get higher score
    }

    // Service providers get moderate boost
    if (item.profile?.userType === 'service_provider') {
      score += 20;
    }

    // Posts with content get boost over profile-only items
    if (item.type === 'post' && item.postImage) {
      score += 30;
    }

    // Add some randomness to prevent staleness
    score += Math.random() * 10;

    return score;
  };

  // Manual refresh function
  const manualRefresh = useCallback(() => {
    console.log('🚀 Manual algorithm refresh triggered');
    setRefreshCount(prev => prev + 1);
  }, []);

  // Auto-refresh interval
  useEffect(() => {
    if (!enabled || autoRefreshInterval <= 0) return;

    const interval = setInterval(() => {
      console.log('🚀 Auto algorithm refresh triggered');
      setRefreshCount(prev => prev + 1);
    }, autoRefreshInterval);

    return () => clearInterval(interval);
  }, [enabled, autoRefreshInterval]);

  return {
    algorithmicFeed,
    isProcessing,
    manualRefresh,
    refreshCount
  };
};
