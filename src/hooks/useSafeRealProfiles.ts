
import { useState, useEffect } from 'react';
import { Profile } from '@/components/feed/types/feedTypes';
import { supabase } from '@/integrations/supabase/client';

interface UseSafeRealProfilesReturn {
  realProfiles: Profile[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export const useSafeRealProfiles = (): UseSafeRealProfilesReturn => {
  const [realProfiles, setRealProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRealProfiles = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('Fetching real user profiles from Supabase...');
      const { data: profiles, error: fetchError } = await supabase
        .from('profiles')
        .select('*')
        .eq('is_blocked', false);

      if (fetchError) {
        console.error('Error fetching real profiles:', fetchError);
        setError(fetchError.message);
        return;
      }

      if (profiles && profiles.length > 0) {
        console.log(`Found ${profiles.length} real user profiles`);
        
        // Transform Supabase profiles to match our Profile interface
        const transformedProfiles: Profile[] = profiles.map(profile => ({
          id: profile.id,
          name: profile.display_name || 'Anonymous',
          age: profile.age || 25,
          image: profile.profile_image_url || '/placeholder.svg',
          bio: profile.bio || 'No bio available',
          whatsapp: profile.whatsapp || '',
          location: profile.location || 'Unknown location',
          gender: (profile.gender as 'male' | 'female') || 'male',
          posts: profile.profile_images || [],
          userType: (profile.user_type as 'user' | 'service_provider' | 'admin' | 'superadmin') || 'user',
          isRealAccount: true
        }));

        setRealProfiles(transformedProfiles);
      } else {
        console.log('No real user profiles found');
        setRealProfiles([]);
      }
    } catch (error) {
      console.error('Error in fetchRealProfiles:', error);
      setError(error instanceof Error ? error.message : 'Unknown error occurred');
      setRealProfiles([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRealProfiles();
  }, []);

  return { 
    realProfiles, 
    loading, 
    error,
    refetch: fetchRealProfiles
  };
};
