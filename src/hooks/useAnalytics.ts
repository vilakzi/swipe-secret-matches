
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export type AnalyticsSummary = {
  total_content: number;
  total_views: number;
  total_likes: number;
  total_shares: number;
  published_content: number;
  draft_content: number;
};

export const useAnalytics = () => {
  const [analytics, setAnalytics] = useState<AnalyticsSummary | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .rpc('get_content_analytics_summary');

      if (error) throw error;
      
      // The RPC function returns an array, take the first element
      const result = Array.isArray(data) ? data[0] : data;
      setAnalytics(result || null);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  return {
    analytics,
    loading,
    refetch: fetchAnalytics,
  };
};
