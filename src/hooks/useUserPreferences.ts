
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
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
  const { user } = useAuth();
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
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (data) {
        setPreferences({
          min_age: data.min_age,
          max_age: data.max_age,
          max_distance: data.max_distance,
          show_me: data.show_me as any,
          location_enabled: data.location_enabled
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

      if (error) throw error;

      setPreferences(updatedPreferences);
      
      toast({
        title: "Preferences updated",
        description: "Your search preferences have been saved."
      });
    } catch (error: any) {
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
