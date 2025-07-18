
import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface SecureAuthWrapperProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  allowedRoles?: ('user' | 'service_provider' | 'admin')[];
}

const SecureAuthWrapper: React.FC<SecureAuthWrapperProps> = ({ 
  children, 
  requireAuth = false,
  allowedRoles = []
}) => {
  const { user, loading } = useAuth();
  const [authorized, setAuthorized] = useState<boolean | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);

  useEffect(() => {
    const checkAuthorization = async () => {
      // If auth is not required, allow access
      if (!requireAuth) {
        setAuthorized(true);
        return;
      }

      // If loading or no user, deny access
      if (loading || !user) {
        setAuthorized(false);
        return;
      }

      // If no role restrictions, allow authenticated users
      if (allowedRoles.length === 0) {
        setAuthorized(true);
        return;
      }

      try {
        // Get user role securely from database
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single();

        if (error) {
          console.error('Error fetching user role:', error);
          setAuthorized(false);
          toast({
            title: "Authorization error",
            description: "Unable to verify your permissions.",
            variant: "destructive",
          });
          return;
        }

        const role = profile?.role || 'user';
        setUserRole(role);

        // Check if user has required role
        if (allowedRoles.includes(role as any)) {
          setAuthorized(true);
        } else {
          setAuthorized(false);
          toast({
            title: "Access denied",
            description: "You don't have permission to access this area.",
            variant: "destructive",
          });
        }
      } catch (error) {
        console.error('Authorization check failed:', error);
        setAuthorized(false);
      }
    };

    checkAuthorization();
  }, [user, loading, requireAuth, allowedRoles]);

  // Show loading state
  if (loading || authorized === null) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-purple-900 flex items-center justify-center">
        <div className="text-white text-lg">Verifying permissions...</div>
      </div>
    );
  }

  // Show unauthorized state
  if (!authorized) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-purple-900 flex items-center justify-center">
        <div className="text-center p-8">
          <h2 className="text-2xl font-bold text-white mb-4">Access Denied</h2>
          <p className="text-gray-300 mb-4">
            {!user ? 'Please sign in to continue.' : `This area requires ${allowedRoles.join(' or ')} access.`}
          </p>
          {userRole && (
            <p className="text-sm text-gray-400">Your current role: {userRole}</p>
          )}
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default SecureAuthWrapper;
