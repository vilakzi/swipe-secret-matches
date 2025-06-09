
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useNewJoiners = () => {
  const [newJoiners, setNewJoiners] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchNewJoiners = async () => {
    try {
      // Use profiles table instead of users table to avoid permission issues
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching new joiners:', error);
        setNewJoiners([]);
        return;
      }

      console.log(`Found ${data?.length || 0} new joiners in last 24 hours`);
      setNewJoiners(data || []);
    } catch (error) {
      console.error('Error in fetchNewJoiners:', error);
      setNewJoiners([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNewJoiners();
  }, []);

  return {
    newJoiners,
    loading,
    refetch: fetchNewJoiners
  };
};
