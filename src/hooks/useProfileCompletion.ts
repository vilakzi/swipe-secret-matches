
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

interface ProfileCompletionStatus {
  isComplete: boolean;
  missingFields: string[];
  profile: any | null;
}

export const useProfileCompletion = () => {
  const { user } = useAuth();
  const [status, setStatus] = useState<ProfileCompletionStatus>({
    isComplete: false,
    missingFields: [],
    profile: null
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      checkProfileCompletion();
    } else {
      setLoading(false);
    }
  }, [user]);

  const checkProfileCompletion = async () => {
    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user?.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching profile:', error);
        setLoading(false);
        return;
      }

      const missingFields = [];
      const requiredFields = [
        { key: 'display_name', label: 'Display Name' },
        { key: 'age', label: 'Age' },
        { key: 'bio', label: 'Bio' },
        { key: 'location', label: 'Location' }
      ];

      requiredFields.forEach(field => {
        if (!profile?.[field.key] || (typeof profile[field.key] === 'string' && profile[field.key].trim() === '')) {
          missingFields.push(field.label);
        }
      });

      setStatus({
        isComplete: missingFields.length === 0,
        missingFields,
        profile: profile || null
      });
    } catch (error) {
      console.error('Error checking profile completion:', error);
    } finally {
      setLoading(false);
    }
  };

  return { ...status, loading, refetch: checkProfileCompletion };
};
