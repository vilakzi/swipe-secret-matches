
import { useState, useEffect, useCallback } from 'react';
import { useEnhancedAuth } from '@/contexts/EnhancedAuthContext';
import { supabase } from '@/integrations/supabase/client';

interface ActivityMetrics {
  dailyActiveStreak: number;
  weeklyEngagement: number;
  totalInteractions: number;
  lastActiveSession: string | null;
}

export const useUserActivity = () => {
  const { user } = useEnhancedAuth();
  const [isActive, setIsActive] = useState(true);
  const [sessionStart] = useState(Date.now());
  const [metrics, setMetrics] = useState<ActivityMetrics>({
    dailyActiveStreak: 0,
    weeklyEngagement: 0,
    totalInteractions: 0,
    lastActiveSession: null
  });

  // Track user activity states
  const [shouldAllowAutoRefresh, setShouldAllowAutoRefresh] = useState(true);
  const [lastInteraction, setLastInteraction] = useState(Date.now());

  // Activity detection
  const updateActivity = useCallback(() => {
    setIsActive(true);
    setLastInteraction(Date.now());
    setShouldAllowAutoRefresh(true);
  }, []);

  // Track when user becomes inactive
  useEffect(() => {
    const checkInactivity = () => {
      const now = Date.now();
      const timeSinceLastInteraction = now - lastInteraction;
      
      if (timeSinceLastInteraction > 30000) { // 30 seconds
        setIsActive(false);
        setShouldAllowAutoRefresh(false);
      }
    };

    const interval = setInterval(checkInactivity, 5000);
    return () => clearInterval(interval);
  }, [lastInteraction]);

  // Global activity listeners
  useEffect(() => {
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
    
    events.forEach(event => {
      document.addEventListener(event, updateActivity, true);
    });

    return () => {
      events.forEach(event => {
        document.removeEventListener(event, updateActivity, true);
      });
    };
  }, [updateActivity]);

  // Update last active in database
  useEffect(() => {
    if (!user) return;

    const updateLastActive = async () => {
      try {
        await supabase
          .from('profiles')
          .update({ last_active: new Date().toISOString() })
          .eq('id', user.id);
      } catch (error) {
        console.warn('Failed to update last active:', error);
      }
    };

    // Update immediately and then every 5 minutes
    updateLastActive();
    const interval = setInterval(updateLastActive, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, [user]);

  // Track session duration and engagement
  useEffect(() => {
    if (!user) return;

    const trackSession = async () => {
      const sessionDuration = Date.now() - sessionStart;
      
      try {
        // You could store this in analytics table
        console.log('Session duration:', sessionDuration / 1000, 'seconds');
      } catch (error) {
        console.warn('Failed to track session:', error);
      }
    };

    // Track session on unmount
    return trackSession;
  }, [user, sessionStart]);

  const trackInteraction = useCallback(async (type: string, data?: any) => {
    if (!user) return;

    try {
      await supabase
        .from('content_analytics')
        .insert({
          content_id: data?.contentId || 'general',
          metric_type: type,
          user_id: user.id,
          value: 1,
          metadata: data
        });

      setMetrics(prev => ({
        ...prev,
        totalInteractions: prev.totalInteractions + 1
      }));
    } catch (error) {
      console.warn('Failed to track interaction:', error);
    }
  }, [user]);

  return {
    isActive,
    shouldAllowAutoRefresh,
    metrics,
    trackInteraction,
    updateActivity
  };
};
