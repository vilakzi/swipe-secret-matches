
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

  // Optimized algorithm with mobile performance considerations
  const algorithmicFeed = useMemo(() => {
    if (!enabled || rawFeedItems.length === 0) {
      console.log('🚀 Algorithm disabled or no items, returning empty array');
      return [];
    }

    // Prevent duplicate processing
    if (isProcessing) {
      console.log('🚀 Algorithm already processing, skipping...');
      return [];
    }

    setIsProcessing(true);
    console.log(`🚀 Algorithm processing ${rawFeedItems.length} items (refresh #${refreshCount + 1})`);

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

      // Mobile-optimized: Return reasonable batch size
      const mobileOptimizedSize = window.innerWidth < 768 ? Math.min(maxItemsPerLoad, 12) : maxItemsPerLoad;
      const finalItems = sortedItems.slice(0, mobileOptimizedSize).map(({ algorithmScore, originalIndex, ...item }) => item);
      
      console.log(`🚀 Algorithm completed: ${finalItems.length} items processed for ${window.innerWidth < 768 ? 'mobile' : 'desktop'}`);
      
      return finalItems;
    } catch (error) {
      console.error('🚀 Algorithm error:', error);
      // Fallback: return original items with mobile optimization
      const fallbackSize = window.innerWidth < 768 ? 8 : maxItemsPerLoad;
      return rawFeedItems.slice(0, fallbackSize);
    } finally {
      // Use timeout to prevent blocking UI on mobile
      setTimeout(() => setIsProcessing(false), 100);
    }
  }, [rawFeedItems, enabled, maxItemsPerLoad, refreshCount]);

  // Calculate item relevance score with mobile considerations
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

    // Mobile-specific: Prefer image content over video on slower connections
    if (window.innerWidth < 768 && item.postImage && !item.postImage.includes('.mp4')) {
      score += 15;
    }

    // Add controlled randomness for diversity
    score += Math.random() * 10;

    return score;
  };

  // Debounced manual refresh for better mobile UX
  const manualRefresh = useCallback(() => {
    if (isProcessing) return;
    
    console.log('🚀 Manual algorithm refresh triggered');
    setRefreshCount(prev => prev + 1);
  }, [isProcessing]);

  // Mobile-optimized auto-refresh
  useEffect(() => {
    if (!enabled || autoRefreshInterval <= 0) return;

    // Longer interval on mobile to save battery
    const interval = window.innerWidth < 768 ? autoRefreshInterval * 1.5 : autoRefreshInterval;
    
    const refreshTimer = setInterval(() => {
      if (!isProcessing) {
        console.log('🚀 Auto algorithm refresh triggered');
        setRefreshCount(prev => prev + 1);
      }
    }, interval);

    return () => clearInterval(refreshTimer);
  }, [enabled, autoRefreshInterval, isProcessing]);

  return {
    algorithmicFeed,
    isProcessing,
    manualRefresh,
    refreshCount
  };
};
