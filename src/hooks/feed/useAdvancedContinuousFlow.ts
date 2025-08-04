import { useState, useCallback, useEffect, useMemo } from 'react';
import { FeedItem } from '@/components/feed/types/feedTypes';

interface AdvancedFlowConfig {
  allAvailableContent: FeedItem[];
  contentPoolSize?: number;
  rotationInterval?: number;
  freshContentPercentage?: number;
}

export const useAdvancedContinuousFlow = ({
  allAvailableContent,
  contentPoolSize = 500,
  rotationInterval = 60000, // 1 minute
  freshContentPercentage = 0.4 // 40% fresh content each rotation
}: AdvancedFlowConfig) => {
  const [sessionId] = useState(() => Date.now() + Math.random());
  const [rotationCycle, setRotationCycle] = useState(0);
  const [viewedContent, setViewedContent] = useState<Set<string>>(new Set());
  const [currentPool, setCurrentPool] = useState<FeedItem[]>([]);

  // Advanced content scoring with dynamic factors
  const scoreContent = useCallback((item: FeedItem, cycleBonus: number): number => {
    let score = 100;

    // Admin content always gets highest priority
    if (item.isAdminCard || item.profile?.role === 'admin' || item.isAdminPost) {
      score += 2000;
    }

    // Fresh content boost based on creation time
    const createdAt = (item as any).createdAt;
    if (createdAt) {
      const ageInHours = (Date.now() - new Date(createdAt).getTime()) / (1000 * 60 * 60);
      if (ageInHours < 2) score += 300; // Very fresh
      else if (ageInHours < 6) score += 200; // Fresh
      else if (ageInHours < 24) score += 100; // Recent
    }

    // Service provider boost
    if (item.profile?.userType === 'service_provider') {
      score += 150;
    }

    // Post with media gets boost
    if (item.type === 'post' && (item.postImage || item.isVideo)) {
      score += 120;
    }

    // New joiner boost
    if ((item.profile as any)?.isNewJoiner) {
      score += 180;
    }

    // Cycle-based rotation bonus
    score += cycleBonus;

    // Anti-staleness: reduce score for viewed content but don't eliminate
    if (viewedContent.has(item.id)) {
      score *= 0.3;
    }

    // Dynamic randomness for variety
    score += Math.random() * 50;

    return score;
  }, [viewedContent]);

  // Create dynamic content pools with advanced mixing
  const generateDynamicPool = useCallback(() => {
    if (allAvailableContent.length === 0) return [];

    // Generating dynamic pool

    // Create multiple content passes for diversity
    const contentPasses: { items: FeedItem[], bonus: number }[] = [
      { items: allAvailableContent, bonus: 100 }, // Fresh pass
      { items: [...allAvailableContent].reverse(), bonus: 80 }, // Reverse order pass
      { items: allAvailableContent.sort(() => Math.random() - 0.5), bonus: 60 }, // Random pass
      { items: allAvailableContent.filter(item => !viewedContent.has(item.id)), bonus: 150 }, // Unseen content
      { items: allAvailableContent.filter(item => viewedContent.has(item.id)), bonus: 40 }, // Recycled content
    ];

    // Score all content from all passes
    const scoredContent = contentPasses.flatMap(pass => 
      pass.items.map(item => ({
        ...item,
        dynamicScore: scoreContent(item, pass.bonus + (rotationCycle * 10))
      }))
    );

    // Remove duplicates while keeping highest scored version
    const uniqueContent = new Map<string, any>();
    scoredContent.forEach(item => {
      const existing = uniqueContent.get(item.id);
      if (!existing || item.dynamicScore > existing.dynamicScore) {
        uniqueContent.set(item.id, item);
      }
    });

    // Sort by score and create diverse flow
    const sortedContent = Array.from(uniqueContent.values())
      .sort((a, b) => b.dynamicScore - a.dynamicScore);

    // Advanced mixing algorithm for diversity
    const finalPool: FeedItem[] = [];
    const typeTracker = new Map<string, number>();
    const profileTracker = new Map<string, number>();

    for (const item of sortedContent) {
      if (finalPool.length >= contentPoolSize) break;

      const contentType = `${item.type}-${item.profile.userType}`;
      const profileId = item.profile.id;
      
      const typeCount = typeTracker.get(contentType) || 0;
      const profileCount = profileTracker.get(profileId) || 0;

      // Diversity controls with admin exception
      const isAdminContent = item.isAdminCard || item.profile?.role === 'admin' || item.isAdminPost;
      
      if (isAdminContent || (typeCount < 4 && profileCount < 3)) {
        finalPool.push({
          ...item,
          algorithmScore: item.dynamicScore,
          cycleGenerated: rotationCycle
        });
        
        typeTracker.set(contentType, typeCount + 1);
        profileTracker.set(profileId, profileCount + 1);
      }
    }

    // Dynamic pool generated

    return finalPool;
  }, [allAvailableContent, contentPoolSize, scoreContent, rotationCycle, viewedContent]);

  // Generate initial pool and set up rotation
  useEffect(() => {
    const newPool = generateDynamicPool();
    setCurrentPool(newPool);
  }, [generateDynamicPool]);

  // Auto-rotation system
  useEffect(() => {
    const rotationTimer = setInterval(() => {
      // Auto-rotating content pool
      setRotationCycle(prev => prev + 1);
      
      // Periodically clear viewed content for recycling
      if (rotationCycle > 0 && rotationCycle % 5 === 0) {
        // Clearing viewed content
        setViewedContent(new Set());
      }
    }, rotationInterval);

    return () => clearInterval(rotationTimer);
  }, [rotationInterval, rotationCycle]);

  // Mark content as viewed
  const markAsViewed = useCallback((itemIds: string[]) => {
    setViewedContent(prev => {
      const newViewed = new Set(prev);
      itemIds.forEach(id => newViewed.add(id));
      return newViewed;
    });
  }, []);

  // Manual refresh with guaranteed different content
  const forceRefresh = useCallback(() => {
    // Force refresh triggered
    setRotationCycle(prev => prev + Math.floor(Math.random() * 10) + 1);
    setViewedContent(new Set()); // Clear for maximum freshness
  }, []);

  // Reset for new session
  const resetSession = useCallback(() => {
    // Resetting session
    setViewedContent(new Set());
    setRotationCycle(0);
  }, []);

  return {
    dynamicContentPool: currentPool,
    markAsViewed,
    forceRefresh,
    resetSession,
    sessionStats: {
      sessionId,
      rotationCycle,
      viewedCount: viewedContent.size,
      poolSize: currentPool.length,
      freshContentAvailable: currentPool.filter(item => !viewedContent.has(item.id)).length
    }
  };
};
