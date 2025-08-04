
import { useState, useEffect, useCallback, useMemo } from 'react';
import { FeedItem } from '@/components/feed/types/feedTypes';

interface UseDynamicFeedAlgorithmProps {
  rawFeedItems: FeedItem[];
  enabled?: boolean;
  autoRefreshInterval?: number;
  maxItemsPerLoad?: number;
}

// Define the score calculation function outside the hook to avoid hoisting issues
const calculateItemScore = (item: FeedItem, index: number): number => {
  let score = 100; // Base score

  // Admin content gets massive boost
  if (item.isAdminCard || item.profile?.role === 'admin') {
    score += 1000;
  }

  // Recent posts get priority
  const createdAt = (item as any).createdAt;
  if (createdAt) {
    const ageInHours = (Date.now() - new Date(createdAt).getTime()) / (1000 * 60 * 60);
    score += Math.max(0, 50 - ageInHours);
  }

  // Service providers get moderate boost
  if (item.profile?.userType === 'service_provider') {
    score += 20;
  }

  // Posts with content get boost over profile-only items
  if (item.type === 'post' && item.postImage) {
    score += 30;
  }

  // Add controlled randomness for diversity
  score += Math.random() * 10;

  return score;
};

export const useDynamicFeedAlgorithm = ({
  rawFeedItems,
  enabled = true,
  autoRefreshInterval = 180000,
  maxItemsPerLoad = 24
}: UseDynamicFeedAlgorithmProps) => {
  const [refreshCount, setRefreshCount] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);

  // Optimized algorithm with race condition prevention
  const algorithmicFeed = useMemo(() => {
    if (!enabled || rawFeedItems.length === 0) {
      // Algorithm disabled, returning raw items
      return rawFeedItems.slice(0, Math.min(maxItemsPerLoad, 12));
    }

    // Algorithm processing items

    try {
      // Enhanced sorting with admin priority and mobile optimization
      const processedItems = rawFeedItems.map((item, index) => ({
        ...item,
        algorithmScore: calculateItemScore(item, index),
        originalIndex: index
      }));

      // Optimized sorting for mobile performance
      const sortedItems = processedItems.sort((a, b) => {
        // Admin posts get highest priority
        const aIsAdmin = a.isAdminCard || a.profile?.role === 'admin';
        const bIsAdmin = b.isAdminCard || b.profile?.role === 'admin';
        
        if (aIsAdmin && !bIsAdmin) return -1;
        if (!aIsAdmin && bIsAdmin) return 1;
        
        // Then by algorithm score
        if (b.algorithmScore !== a.algorithmScore) {
          return b.algorithmScore - a.algorithmScore;
        }
        
        // Finally by original order for consistency
        return a.originalIndex - b.originalIndex;
      });

      // Return reasonable batch size
      const finalSize = Math.min(maxItemsPerLoad, sortedItems.length);
      const finalItems = sortedItems.slice(0, finalSize).map(({ algorithmScore, originalIndex, ...item }) => item);
      
      // Algorithm completed processing
      
      return finalItems;
    } catch (error) {
      // Algorithm processing error
      // Fallback: return original items
      return rawFeedItems.slice(0, Math.min(maxItemsPerLoad, 12));
    }
  }, [rawFeedItems, enabled, maxItemsPerLoad, refreshCount]);

  // Manual refresh
  const manualRefresh = useCallback(() => {
    // Manual algorithm refresh triggered
    setRefreshCount(prev => prev + 1);
  }, []);

  // Auto-refresh
  useEffect(() => {
    if (!enabled || autoRefreshInterval <= 0) return;

    const refreshTimer = setInterval(() => {
      // Auto algorithm refresh triggered
      setRefreshCount(prev => prev + 1);
    }, autoRefreshInterval);

    return () => clearInterval(refreshTimer);
  }, [enabled, autoRefreshInterval]);

  return {
    algorithmicFeed,
    isProcessing: false, // Simplified to prevent race conditions
    manualRefresh,
    refreshCount
  };
};
