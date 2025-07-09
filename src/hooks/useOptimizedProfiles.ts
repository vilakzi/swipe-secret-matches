
import { useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useEnhancedAuth } from '@/contexts/EnhancedAuthContext';
import { useUserRole } from '@/hooks/useUserRole';

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
  const { role } = useUserRole();

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

      setProfiles(data || []);
    } catch (err) {
      console.error('Unexpected error:', err);
      setError('Failed to load profiles');
    } finally {
      setLoading(false);
    }
  }, [user]);

  const filteredProfiles = useMemo(() => {
    if (!profiles.length) return [];
    
    return profiles.filter(profile => {
      // Don't show own profile
      if (profile.id === user?.id) return false;
      
      // Role-based filtering
      if (role === 'admin') return true;
      if (role === 'user') return profile.user_type === 'service_provider';
      if (role === 'service_provider') return profile.user_type === 'user';
      
      return true;
    });
  }, [profiles, user?.id, role]);

  useEffect(() => {
    fetchProfiles();
  }, [fetchProfiles]);

  return {
    profiles: filteredProfiles,
    loading,
    error,
    refetch: fetchProfiles,
    totalCount: profiles.length
  };
};
