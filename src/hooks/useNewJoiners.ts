
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface NewJoiner {
  id: string;
  display_name: string;
  age: number;
  profile_image_url: string;
  bio: string;
  whatsapp: string;
  location: string;
  gender: 'male' | 'female';
  user_type: 'user' | 'service_provider';
  user_created_at: string;
  is_new_joiner: boolean;
}

export const useNewJoiners = () => {
  const [newJoiners, setNewJoiners] = useState<NewJoiner[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchNewJoiners = async () => {
    try {
      const { data, error } = await supabase
        .from('new_joiners_feed')
        .select('*')
        .order('user_created_at', { ascending: false });

      if (error) {
        console.error('Error fetching new joiners:', error);
        return;
      }

      // Filter and type-cast the data to ensure gender compatibility
      const typedData = (data || []).map(joiner => ({
        ...joiner,
        gender: (joiner.gender === 'male' || joiner.gender === 'female') ? joiner.gender : 'male'
      })) as NewJoiner[];

      setNewJoiners(typedData);
    } catch (error) {
      console.error('Error in fetchNewJoiners:', error);
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
