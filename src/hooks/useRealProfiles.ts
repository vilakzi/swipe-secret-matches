
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Profile } from '@/components/feed/types/feedTypes';

export const useRealProfiles = () => {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProfiles = async () => {
    try {
      console.log('Fetching real user profiles from Supabase...');
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('profiles')
        .select(`
          id,
          display_name,
          age,
          bio,
          location,
          profile_image_url,
          profile_images,
          interests,
          gender,
          user_type,
          created_at
        `)
        .eq('is_blocked', false)
        .not('display_name', 'is', null)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching profiles:', error);
        setError(error.message);
        return;
      }

      // Safely handle the data array
      const profilesArray = Array.isArray(data) ? data : [];
      console.log(`Found ${profilesArray.length} real user profiles`);

      // Transform the data to match the Profile interface
      const transformedProfiles: Profile[] = profilesArray
        .filter(profile => profile && profile.display_name) // Filter out null/undefined profiles
        .map(profile => ({
          id: profile.id,
          name: profile.display_name || 'Anonymous',
          age: profile.age || 0,
          bio: profile.bio || '',
          location: profile.location || '',
          images: Array.isArray(profile.profile_images) && profile.profile_images.length > 0 
            ? profile.profile_images 
            : (profile.profile_image_url ? [profile.profile_image_url] : []),
          interests: Array.isArray(profile.interests) ? profile.interests : [],
          gender: profile.gender || '',
          userType: profile.user_type || 'user',
          isNewJoiner: false,
          createdAt: profile.created_at
        }));

      setProfiles(transformedProfiles);
    } catch (err: any) {
      console.error('Unexpected error fetching profiles:', err);
      setError(err.message || 'An unexpected error occurred');
      setProfiles([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfiles();
  }, []);

  const refetch = () => {
    fetchProfiles();
  };

  return {
    profiles,
    loading,
    error,
    refetch
  };
};
