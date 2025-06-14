
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

export type UserRole = 'user' | 'service_provider' | 'admin';

export const useUserRole = () => {
  const { user } = useAuth();
  const [role, setRole] = useState<UserRole>('user');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserRole = async () => {
      if (!user) {
        setRole('user');
        setLoading(false);
        return;
      }

      try {
        // First check the profiles table
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single();

        if (!profileError && profile?.role) {
          setRole(profile.role as UserRole);
        } else {
          // Fallback to user_roles table
          const { data: userRole, error: roleError } = await supabase
            .rpc('get_user_role', { _user_id: user.id });

          if (!roleError && userRole) {
            setRole(userRole as UserRole);
          } else {
            setRole('user');
          }
        }
      } catch (error) {
        console.error('Error fetching user role:', error);
        setRole('user');
      } finally {
        setLoading(false);
      }
    };

    fetchUserRole();
  }, [user]);

  const isAdmin = role === 'admin';
  const isServiceProvider = role === 'service_provider';
  const isUser = role === 'user';

  return {
    role,
    loading,
    isAdmin,
    isServiceProvider,
    isUser,
  };
};
