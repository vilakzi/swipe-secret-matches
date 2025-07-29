import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export const useRealTimeActivity = () => {
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;

    // Update user's online status
    const updateActivity = async () => {
      await supabase
        .from('user_activity')
        .upsert({
          user_id: user.id,
          last_seen_at: new Date().toISOString(),
          is_online: true,
        });
    };

    // Set initial status
    updateActivity();

    // Update activity every 30 seconds
    const activityInterval = setInterval(updateActivity, 30000);

    // Update on page focus
    const handleFocus = () => updateActivity();
    window.addEventListener('focus', handleFocus);

    // Set offline status on page blur
    const handleBlur = async () => {
      await supabase
        .from('user_activity')
        .update({ is_online: false })
        .eq('user_id', user.id);
    };
    window.addEventListener('blur', handleBlur);

    // Set offline status on beforeunload
    const handleBeforeUnload = () => {
      navigator.sendBeacon('/api/user-offline', JSON.stringify({ userId: user.id }));
    };
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      clearInterval(activityInterval);
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('blur', handleBlur);
      window.removeEventListener('beforeunload', handleBeforeUnload);
      
      // Set offline status
      supabase
        .from('user_activity')
        .update({ is_online: false })
        .eq('user_id', user.id);
    };
  }, [user]);
};