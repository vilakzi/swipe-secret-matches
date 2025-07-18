
import { useState, useEffect } from 'react';
import { useEnhancedAuth } from '@/contexts/EnhancedAuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface UserPreferences {
  min_age: number;
  max_age: number;
  max_distance: number;
  show_me: 'men' | 'women' | 'everyone';
  location_enabled: boolean;
}

export const useUserPreferences = () => {
  const { user } = useEnhancedAuth();
  const [preferences, setPreferences] = useState<UserPreferences>({
    min_age: 18,
    max_age: 50,
    max_distance: 50,
    show_me: 'everyone',
    location_enabled: true
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      fetchPreferences();
    }
  }, [user]);

  const fetchPreferences = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('user_preferences')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle(); // Use maybeSingle instead of single to avoid errors when no data

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching preferences:', error);
        return;
      }

      if (data) {
        setPreferences({
          min_age: data.min_age || 18,
          max_age: data.max_age || 50,
          max_distance: data.max_distance || 50,
          show_me: (data.show_me as any) || 'everyone',
          location_enabled: data.location_enabled ?? true
        });
      }
    } catch (error: any) {
      console.error('Error fetching preferences:', error);
    }
  };

  const updatePreferences = async (newPreferences: Partial<UserPreferences>) => {
    if (!user) return;

    setLoading(true);
    try {
      const updatedPreferences = { ...preferences, ...newPreferences };
      
      const { error } = await supabase
        .from('user_preferences')
        .upsert({
          user_id: user.id,
          ...updatedPreferences,
          updated_at: new Date().toISOString()
        });

      if (error) {
        console.error('Error updating preferences:', error);
        toast({
          title: "Error updating preferences",
          description: error.message,
          variant: "destructive"
        });
        return;
      }

      setPreferences(updatedPreferences);
      
      toast({
        title: "Preferences updated",
        description: "Your search preferences have been saved."
      });
    } catch (error: any) {
      console.error('Error updating preferences:', error);
      toast({
        title: "Error updating preferences",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return {
    preferences,
    loading,
    updatePreferences,
    refetch: fetchPreferences
  };
};
