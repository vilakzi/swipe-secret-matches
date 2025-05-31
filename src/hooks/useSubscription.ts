
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

interface SubscriptionStatus {
  subscribed: boolean;
  loading: boolean;
  error?: string;
}

interface UsageStatus {
  scrollsToday: number;
  remainingScrolls: number;
  loading: boolean;
}

export const useSubscription = () => {
  const { user, session } = useAuth();
  const [status, setStatus] = useState<SubscriptionStatus>({
    subscribed: false,
    loading: true
  });

  const checkSubscription = async () => {
    if (!user || !session) {
      setStatus({ subscribed: false, loading: false });
      return;
    }

    try {
      setStatus(prev => ({ ...prev, loading: true }));
      
      const { data, error } = await supabase.functions.invoke('check-subscription', {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (error) throw error;

      setStatus({
        subscribed: data.subscribed || false,
        loading: false
      });
    } catch (error) {
      console.error('Error checking subscription:', error);
      setStatus({
        subscribed: false,
        loading: false,
        error: 'Failed to check subscription status'
      });
    }
  };

  useEffect(() => {
    checkSubscription();
  }, [user, session]);

  return { ...status, refetch: checkSubscription };
};

export const useUsageTracking = () => {
  const { user, session } = useAuth();
  const [usage, setUsage] = useState<UsageStatus>({
    scrollsToday: 0,
    remainingScrolls: 5,
    loading: true
  });

  const trackScroll = async () => {
    if (!user || !session) return;

    try {
      const { data, error } = await supabase.functions.invoke('track-usage', {
        body: { action: 'scroll' },
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (error) throw error;

      setUsage({
        scrollsToday: data.scrolls_today,
        remainingScrolls: data.remaining_scrolls,
        loading: false
      });

      return data.remaining_scrolls > 0;
    } catch (error) {
      console.error('Error tracking scroll:', error);
      return false;
    }
  };

  const checkUsage = async () => {
    if (!user || !session) {
      setUsage({ scrollsToday: 0, remainingScrolls: 5, loading: false });
      return;
    }

    try {
      const { data, error } = await supabase.functions.invoke('track-usage', {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (error) throw error;

      setUsage({
        scrollsToday: data.scrolls_today,
        remainingScrolls: data.remaining_scrolls,
        loading: false
      });
    } catch (error) {
      console.error('Error checking usage:', error);
      setUsage({ scrollsToday: 0, remainingScrolls: 5, loading: false });
    }
  };

  useEffect(() => {
    checkUsage();
  }, [user, session]);

  return { ...usage, trackScroll, refetch: checkUsage };
};
