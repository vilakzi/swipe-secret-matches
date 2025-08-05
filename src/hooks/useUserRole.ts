import * as React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

// Cache for user roles to prevent repeated API calls
const roleCache = new Map<string, { role: string; timestamp: number }>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export const useUserRole = () => {
  const { user } = useAuth();
  const [role, setRole] = React.useState<string>('user');
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchUserRole = async () => {
      if (!user) {
        setRole('user');
        setLoading(false);
        return;
      }

      // Check cache first
      const cached = roleCache.get(user.id);
      if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
        setRole(cached.role);
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .maybeSingle();

        if (error) {
          // Only log actual errors, not "no rows found"
          if (error.code !== 'PGRST116') {
            console.error('Error fetching user role:', error);
          }
          setRole('user');
        } else {
          const userRole = data?.role || 'user';
          setRole(userRole);
          
          // Cache the result
          roleCache.set(user.id, {
            role: userRole,
            timestamp: Date.now()
          });
        }
      } catch (error) {
        setRole('user');
      } finally {
        setLoading(false);
      }
    };

    fetchUserRole();
  }, [user]);

  const isAdmin = role === 'admin';
  const isServiceProvider = role === 'service_provider' || role === 'admin';

  // Clear cache when user changes
  React.useEffect(() => {
    if (!user) {
      roleCache.clear();
    }
  }, [user]);

  return {
    role,
    isAdmin,
    isServiceProvider,
    loading,
  };
};