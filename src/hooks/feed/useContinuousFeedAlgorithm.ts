
import { useState, useEffect, useCallback, useMemo } from 'react';
import { FeedItem } from '@/components/feed/types/feedTypes';

interface ContinuousFeedConfig {
  rawFeedItems: FeedItem[];
  enabled?: boolean;
  contentPoolSize?: number;
  refreshInterval?: number;
  seenContentResetTime?: number;
}

export const useContinuousFeedAlgorithm = ({
  rawFeedItems,
  enabled = true,
  contentPoolSize = 200,
  refreshInterval = 120000, // 2 minutes
  seenContentResetTime = 1800000 // 30 minutes
}: ContinuousFeedConfig) => {
  const [seenContent, setSeenContent] = useState<Set<string>>(new Set());
  const [refreshCount, setRefreshCount] = useState(0);
  const [contentQueue, setContentQueue] = useState<FeedItem[]>([]);

  // Content scoring with engagement optimization
  const scoreContent = useCallback((item: FeedItem, index: number, timeBonus: number = 0): number => {
    let score = 100;

    // Admin content gets massive priority
    if (item.isAdminCard || item.profile?.role === 'admin') {
      score += 2000;
    }

    // Recent posts get significant boost
    const createdAt = (item as any).createdAt;
    if (createdAt) {
      const ageInHours = (Date.now() - new Date(createdAt).getTime()) / (1000 * 60 * 60);
      score += Math.max(0, 100 - ageInHours * 2);
    }

    // Service providers get boost
    if (item.profile?.userType === 'service_provider') {
      score += 50;
    }

    // Posts with content get boost
    if (item.type === 'post' && item.postImage) {
      score += 80;
    }

    // New joiners get priority
    if ((item.profile as any)?.isNewJoiner) {
      score += 60;
    }

    // Add time-based bonus for continuous refresh
    score += timeBonus;

    // Add controlled randomness for variety
    score += Math.random() * 20;

    // Penalize seen content but don't eliminate it completely
    if (seenContent.has(item.id)) {
      score *= 0.3;
    }

    return score;
  }, [seenContent]);

  // Advanced content mixing algorithm
  const createContinuousContentPool = useCallback(() => {
    if (!enabled || rawFeedItems.length === 0) {
      return rawFeedItems.slice(0, 20);
    }

    // Creating continuous content pool

    // Create multiple passes of content with different scoring
    const contentPools: FeedItem[][] = [];
    
    // Pass 1: Fresh content (high priority)
    const freshItems = rawFeedItems.map((item, index) => ({
      ...item,
      dynamicScore: scoreContent(item, index, 50)
    }));
    
    // Pass 2: Recycled content (medium priority)
    const recycledItems = rawFeedItems.map((item, index) => ({
      ...item,
      dynamicScore: scoreContent(item, index, 0)
    }));
    
    // Pass 3: Filler content (ensures no empty states)
    const fillerItems = rawFeedItems.map((item, index) => ({
      ...item,
      dynamicScore: scoreContent(item, index, -20)
    }));

    contentPools.push(freshItems, recycledItems, fillerItems);

    // Merge and sort all pools
    const allPoolItems = contentPools.flat().sort((a, b) => {
      const aScore = (a as any).dynamicScore || 0;
      const bScore = (b as any).dynamicScore || 0;
      return bScore - aScore;
    });

    // Create diverse content flow with spacing
    const finalPool: FeedItem[] = [];
    const usedTypes = new Map<string, number>();
    const usedProfiles = new Map<string, number>();

    for (const item of allPoolItems) {
      if (finalPool.length >= contentPoolSize) break;

      const typeKey = `${item.type}-${item.profile.userType}`;
      const profileKey = item.profile.id;
      
      const typeCount = usedTypes.get(typeKey) || 0;
      const profileCount = usedProfiles.get(profileKey) || 0;

      // Diversity controls - prevent clustering
      if (typeCount < 3 && profileCount < 2) {
        finalPool.push({
          ...item,
          algorithmScore: (item as any).dynamicScore
        });
        usedTypes.set(typeKey, typeCount + 1);
        usedProfiles.set(profileKey, profileCount + 1);
      }
    }

    // Continuous pool created

    return finalPool;
  }, [rawFeedItems, enabled, contentPoolSize, scoreContent, refreshCount]);

  // Create initial content queue
  const continuousContentQueue = useMemo(() => {
    return createContinuousContentPool();
  }, [createContinuousContentPool]);

  // Auto-refresh system
  useEffect(() => {
    if (!enabled) return;

    const refreshTimer = setInterval(() => {
      // Auto-refreshing continuous feed
      setRefreshCount(prev => prev + 1);
      setContentQueue(createContinuousContentPool());
    }, refreshInterval);

    return () => clearInterval(refreshTimer);
  }, [enabled, refreshInterval, createContinuousContentPool]);

  // Seen content reset system
  useEffect(() => {
    if (!enabled) return;

    const resetTimer = setInterval(() => {
      // Resetting seen content
      setSeenContent(new Set());
    }, seenContentResetTime);

    return () => clearInterval(resetTimer);
  }, [enabled, seenContentResetTime]);

  // Mark content as seen
  const markContentAsSeen = useCallback((itemIds: string[]) => {
    setSeenContent(prev => {
      const newSeen = new Set(prev);
      itemIds.forEach(id => newSeen.add(id));
      return newSeen;
    });
  }, []);

  // Manual refresh
  const refreshContentPool = useCallback(() => {
    // Manual refresh triggered
    setRefreshCount(prev => prev + 1);
    setContentQueue(createContinuousContentPool());
  }, [createContinuousContentPool]);

  return {
    continuousContentQueue: contentQueue.length > 0 ? contentQueue : continuousContentQueue,
    markContentAsSeen,
    refreshContentPool,
    seenContentCount: seenContent.size,
    refreshCount
  };
};
