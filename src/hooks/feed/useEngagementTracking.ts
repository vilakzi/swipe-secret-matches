
import { useState, useCallback, useRef, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface EngagementEvent {
  itemId: string;
  type: 'view' | 'like' | 'contact' | 'scroll_pause' | 'tap';
  duration?: number;
  timestamp: number;
}

export const useEngagementTracking = () => {
  const [engagementData, setEngagementData] = useState(() => new Map());
  const viewTimersRef = useRef(() => new Map());

  // Clean up timers on unmount
  useEffect(() => {
    return () => {
      const timers = viewTimersRef.current();
      timers.forEach((timerData) => {
        if (timerData?.timer) {
          clearTimeout(timerData.timer);
        }
      });
      timers.clear();
    };
  }, []);

  // Track when user starts viewing an item
  const trackItemView = useCallback((itemId) => {
    if (!itemId) return;
    
    const startTime = Date.now();
    const timers = viewTimersRef.current();
    
    // Clear existing timer for this item
    const existingTimer = timers.get(itemId);
    if (existingTimer?.timer) {
      clearTimeout(existingTimer.timer);
    }

    // Set new timer
    const timer = setTimeout(() => {
      const event = {
        itemId,
        type: 'view',
        duration: Date.now() - startTime,
        timestamp: Date.now()
      };

      setEngagementData(prev => {
        const newData = new Map(prev);
        const existing = newData.get(itemId) || [];
        newData.set(itemId, [...existing, event]);
        return newData;
      });

      timers.delete(itemId);
    }, 1000);

    timers.set(itemId, { startTime, timer });
  }, []);

  // Track when user stops viewing an item
  const trackItemViewEnd = useCallback((itemId) => {
    if (!itemId) return;
    
    const timers = viewTimersRef.current();
    const timerData = timers.get(itemId);
    if (timerData?.timer) {
      clearTimeout(timerData.timer);
      timers.delete(itemId);
    }
  }, []);

  // Track engagement events
  const trackEngagement = useCallback((itemId, type) => {
    if (!itemId || !type) return;
    
    const event = {
      itemId,
      type,
      timestamp: Date.now()
    };

    setEngagementData(prev => {
      const newData = new Map(prev);
      const existing = newData.get(itemId) || [];
      newData.set(itemId, [...existing, event]);
      return newData;
    });

    // Send to database for analytics (async, non-blocking)
    if (type === 'like' || type === 'contact') {
      supabase
        .from('content_analytics')
        .insert({
          content_id: itemId,
          metric_type: type,
          value: 1
        })
        .then(() => {
          // Analytics tracked
        })
        .catch((error) => {
          // Analytics tracking failed
        });
    }
  }, []);

  // Get engagement score for an item
  const getEngagementScore = useCallback((itemId) => {
    if (!itemId) return 0;
    
    const events = engagementData.get(itemId) || [];
    let score = 0;

    events.forEach(event => {
      switch (event.type) {
        case 'view':
          score += event.duration && event.duration > 3000 ? 2 : 1;
          break;
        case 'like':
          score += 5;
          break;
        case 'contact':
          score += 10;
          break;
        case 'scroll_pause':
          score += 1;
          break;
        case 'tap':
          score += 2;
          break;
      }
    });

    return score;
  }, [engagementData]);

  // Get trending items
  const getTrendingItems = useCallback((timeWindowMs = 300000) => {
    const cutoffTime = Date.now() - timeWindowMs;
    const itemScores = new Map();

    engagementData.forEach((events, itemId) => {
      const recentEvents = events.filter(event => 
        event.timestamp > cutoffTime
      );
      
      const score = recentEvents.reduce((total, event) => {
        switch (event.type) {
          case 'like': return total + 5;
          case 'contact': return total + 10;
          case 'view': return total + 1;
          default: return total + 1;
        }
      }, 0);

      if (score > 0) {
        itemScores.set(itemId, score);
      }
    });

    return Array.from(itemScores.entries())
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([itemId]) => itemId);
  }, [engagementData]);

  return {
    trackItemView,
    trackItemViewEnd,
    trackEngagement,
    getEngagementScore,
    getTrendingItems,
    engagementData
  };
};
