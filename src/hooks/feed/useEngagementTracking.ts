
import { useState, useCallback, useRef, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface EngagementEvent {
  itemId: string;
  type: 'view' | 'like' | 'contact' | 'scroll_pause' | 'tap';
  duration?: number;
  timestamp: number;
}

export const useEngagementTracking = () => {
  const [engagementData, setEngagementData] = useState(new Map());
  const viewTimersRef = useRef(new Map());

  // Clean up timers on unmount - STABLE empty dependency array
  useEffect(() => {
    return () => {
      const timers = viewTimersRef.current;
      if (timers && typeof timers.forEach === 'function') {
        timers.forEach((timerData) => {
          if (timerData && timerData.timer) {
            clearTimeout(timerData.timer);
          }
        });
        timers.clear();
      }
    };
  }, []);

  // Track when user starts viewing an item
  const trackItemView = useCallback((itemId) => {
    if (!itemId || typeof itemId !== 'string') return;
    
    const startTime = Date.now();
    
    // Clear existing timer for this item
    const existingTimer = viewTimersRef.current.get(itemId);
    if (existingTimer && existingTimer.timer) {
      clearTimeout(existingTimer.timer);
    }

    // Set new timer - track as "viewed" after 1 second
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

      // Remove from timers
      viewTimersRef.current.delete(itemId);
    }, 1000);

    viewTimersRef.current.set(itemId, { startTime, timer });
  }, []);

  // Track when user stops viewing an item
  const trackItemViewEnd = useCallback((itemId) => {
    if (!itemId || typeof itemId !== 'string') return;
    
    const timerData = viewTimersRef.current.get(itemId);
    if (timerData && timerData.timer) {
      clearTimeout(timerData.timer);
      viewTimersRef.current.delete(itemId);
    }
  }, []);

  // Track engagement events (likes, contacts, etc.)
  const trackEngagement = useCallback((itemId, type) => {
    if (!itemId || !type || typeof itemId !== 'string' || typeof type !== 'string') return;
    
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
        .select()
        .then((result) => {
          if (result.error) {
            console.warn('Analytics tracking error:', result.error);
          }
        })
        .catch((error) => {
          console.warn('Analytics tracking failed:', error);
        });
    }
  }, []);

  // Get engagement score for an item
  const getEngagementScore = useCallback((itemId) => {
    if (!itemId || typeof itemId !== 'string') return 0;
    
    const events = engagementData.get(itemId) || [];
    let score = 0;

    events.forEach(event => {
      if (!event || !event.type) return;
      
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

  // Get trending items based on recent engagement
  const getTrendingItems = useCallback((timeWindowMs = 300000) => {
    const cutoffTime = Date.now() - timeWindowMs;
    const itemScores = new Map();

    if (!engagementData || typeof engagementData.forEach !== 'function') {
      return [];
    }

    engagementData.forEach((events, itemId) => {
      if (!Array.isArray(events)) return;
      
      const recentEvents = events.filter(event => 
        event && event.timestamp && event.timestamp > cutoffTime
      );
      
      const score = recentEvents.reduce((total, event) => {
        if (!event || !event.type) return total;
        
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

  // Clear old engagement data to prevent memory issues
  const clearOldEngagementData = useCallback((maxAge = 3600000) => {
    const cutoffTime = Date.now() - maxAge;
    
    setEngagementData(prev => {
      const newData = new Map();
      if (prev && typeof prev.forEach === 'function') {
        prev.forEach((events, itemId) => {
          if (Array.isArray(events)) {
            const recentEvents = events.filter(event => 
              event && event.timestamp && event.timestamp > cutoffTime
            );
            if (recentEvents.length > 0) {
              newData.set(itemId, recentEvents);
            }
          }
        });
      }
      return newData;
    });
  }, []);

  return {
    trackItemView,
    trackItemViewEnd,
    trackEngagement,
    getEngagementScore,
    getTrendingItems,
    clearOldEngagementData,
    engagementData
  };
};
