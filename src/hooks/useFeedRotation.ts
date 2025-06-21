
import { useState, useEffect, useCallback } from 'react';
import { FeedItem } from '@/components/feed/types/feedTypes';
import { useAuth } from '@/contexts/AuthContext';
import { useUserRole } from '@/hooks/useUserRole';

interface FeedRotationOptions {
  rotationInterval: number;
  superAdminBoost: number;
  maxConsecutivePosts: number;
}

export const useFeedRotation = (
  feedItems: FeedItem[],
  options: FeedRotationOptions = {
    rotationInterval: 8000, // 8 seconds
    superAdminBoost: 3, // Super admin posts appear 3x more frequently
    maxConsecutivePosts: 2 // Max consecutive posts from same user
  }
) => {
  const { user } = useAuth();
  const { role } = useUserRole();
  const [rotatedFeed, setRotatedFeed] = useState<FeedItem[]>([]);
  const [currentRotationIndex, setCurrentRotationIndex] = useState(0);

  const isAdminRole = (userRole: string) => {
    return ['admin', 'superadmin'].includes(userRole?.toLowerCase() || '');
  };

  const prioritizeAndShuffleFeed = useCallback((items: FeedItem[]) => {
    if (!items.length) return [];

    // Separate admin and user posts
    const adminPosts = items.filter(item => 
      isAdminRole(item.profile.role || item.profile.userType)
    );
    const userPosts = items.filter(item => 
      !isAdminRole(item.profile.role || item.profile.userType)
    );

    // Create multiple copies of admin posts for prioritization
    const boostedAdminPosts = [];
    for (let i = 0; i < options.superAdminBoost; i++) {
      boostedAdminPosts.push(...adminPosts);
    }

    // Combine and shuffle
    const allPosts = [...boostedAdminPosts, ...userPosts];
    
    // Advanced shuffle with consecutive post prevention
    const shuffled: FeedItem[] = [];
    const remaining = [...allPosts];
    let lastUserId = '';
    let consecutiveCount = 0;

    while (remaining.length > 0) {
      // Filter out posts from same user if we've hit the limit
      let availablePosts = remaining;
      if (consecutiveCount >= options.maxConsecutivePosts) {
        availablePosts = remaining.filter(item => item.profile.id !== lastUserId);
        if (availablePosts.length === 0) {
          // Reset if no other posts available
          availablePosts = remaining;
          consecutiveCount = 0;
        }
      }

      // Pick random post from available
      const randomIndex = Math.floor(Math.random() * availablePosts.length);
      const selectedPost = availablePosts[randomIndex];
      
      shuffled.push(selectedPost);
      
      // Remove from remaining
      const originalIndex = remaining.findIndex(item => 
        item.id === selectedPost.id && 
        item.profile.id === selectedPost.profile.id
      );
      remaining.splice(originalIndex, 1);

      // Track consecutive posts
      if (selectedPost.profile.id === lastUserId) {
        consecutiveCount++;
      } else {
        consecutiveCount = 1;
        lastUserId = selectedPost.profile.id;
      }
    }

    return shuffled;
  }, [options.superAdminBoost, options.maxConsecutivePosts]);

  // Auto-rotation effect
  useEffect(() => {
    if (!rotatedFeed.length) return;

    const interval = setInterval(() => {
      setCurrentRotationIndex(prev => (prev + 1) % rotatedFeed.length);
    }, options.rotationInterval);

    return () => clearInterval(interval);
  }, [rotatedFeed.length, options.rotationInterval]);

  // Update rotated feed when items change
  useEffect(() => {
    const shuffledFeed = prioritizeAndShuffleFeed(feedItems);
    setRotatedFeed(shuffledFeed);
    setCurrentRotationIndex(0);
  }, [feedItems, prioritizeAndShuffleFeed]);

  const refreshRotation = useCallback(() => {
    const shuffledFeed = prioritizeAndShuffleFeed(feedItems);
    setRotatedFeed(shuffledFeed);
    setCurrentRotationIndex(0);
  }, [feedItems, prioritizeAndShuffleFeed]);

  const getVisibleItems = useCallback((count: number = 6) => {
    if (!rotatedFeed.length) return [];
    
    const visibleItems = [];
    for (let i = 0; i < count && i < rotatedFeed.length; i++) {
      const index = (currentRotationIndex + i) % rotatedFeed.length;
      visibleItems.push(rotatedFeed[index]);
    }
    
    return visibleItems;
  }, [rotatedFeed, currentRotationIndex]);

  return {
    rotatedFeed,
    currentRotationIndex,
    getVisibleItems,
    refreshRotation,
    isRotating: rotatedFeed.length > 0
  };
};
