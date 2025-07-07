
import { useState, useEffect } from 'react';
import { useEnhancedAuth } from '@/contexts/EnhancedAuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface Match {
  id: string;
  user1_id: string;
  user2_id: string;
  created_at: string;
  expires_at: string;
  is_super_like: boolean;
  profile?: any;
}

export const useMatches = () => {
  const { user } = useEnhancedAuth();
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      fetchMatches();
    }
  }, [user]);

  const fetchMatches = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const { data: matchesData, error } = await supabase
        .from('matches')
        .select(`
          *,
          profiles!matches_user1_id_fkey(*),
          profiles!matches_user2_id_fkey(*)
        `)
        .or(`user1_id.eq.${user.id},user2_id.eq.${user.id}`)
        .gt('expires_at', new Date().toISOString())
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Process matches to get the other user's profile
      const processedMatches = matchesData?.map(match => ({
        ...match,
        profile: match.user1_id === user.id ? match.profiles[1] : match.profiles[0]
      })) || [];

      setMatches(processedMatches);
    } catch (error: any) {
      toast({
        title: "Error loading matches",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return {
    matches,
    loading,
    refetch: fetchMatches
  };
};
