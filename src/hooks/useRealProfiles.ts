
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Profile } from '@/data/demoProfiles';

export const useRealProfiles = () => {
  const [realProfiles, setRealProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRealProfiles = async () => {
      try {
        console.log('Fetching real user profiles from Supabase...');
        const { data: profiles, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('is_blocked', false);

        if (error) {
          console.error('Error fetching real profiles:', error);
          return;
        }

        if (profiles && profiles.length > 0) {
          console.log(`Found ${profiles.length} real user profiles`);
          
          // Transform Supabase profiles to match our Profile interface with real account flag
          const transformedProfiles: Profile[] = profiles.map(profile => ({
            id: profile.id,
            name: profile.display_name || 'Anonymous',
            age: profile.age || 25,
            image: profile.profile_image_url || '/placeholder.svg',
            bio: profile.bio || 'No bio available',
            whatsapp: profile.whatsapp || '',
            location: profile.location || 'Unknown location',
            gender: profile.gender as 'male' | 'female' || 'male',
            posts: profile.profile_images || [],
            userType: profile.user_type as 'user' | 'service_provider' || 'user',
            isRealAccount: true // Mark as real account
          }));

          setRealProfiles(transformedProfiles);
        } else {
          console.log('No real user profiles found');
          setRealProfiles([]);
        }
      } catch (error) {
        console.error('Error in fetchRealProfiles:', error);
        setRealProfiles([]);
      } finally {
        setLoading(false);
      }
    };

    fetchRealProfiles();
  }, []);

  return { realProfiles, loading };
};
