
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useEnhancedAuth } from '@/contexts/EnhancedAuthContext';

interface Profile {
  id: string;
  display_name: string | null;
  age: number | null;
  bio: string | null;
  location: string | null;
  profile_image_url: string | null;
  user_type: 'user' | 'service_provider' | 'admin' | 'superadmin' | null;
  created_at: string;
  whatsapp: string | null;
}

export const useOptimizedProfiles = () => {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useEnhancedAuth();

  const fetchProfiles = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      const { data, error: fetchError } = await supabase
        .from('profiles')
        .select('*')
        .eq('is_blocked', false)
        .order('created_at', { ascending: false })
        .limit(50);

      if (fetchError) {
        console.error('Fetch error:', fetchError);
        setError(fetchError.message);
        return;
      }

      setProfiles(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Unexpected error:', err);
      setError('Failed to load profiles');
    } finally {
      setLoading(false);
    }
  }, [user]);

  const filteredProfiles = Array.isArray(profiles) ? profiles.filter(profile => {
    // Don't show own profile
    if (profile.id === user?.id) return false;
    return true;
  }) : [];

  useEffect(() => {
    fetchProfiles();
  }, [fetchProfiles]);

  return {
    profiles: filteredProfiles,
    loading,
    error,
    refetch: fetchProfiles,
    totalCount: Array.isArray(profiles) ? profiles.length : 0
  };
};
