
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

interface ServiceProviderRouteProps {
  children: React.ReactNode;
}

const ServiceProviderRoute: React.FC<ServiceProviderRouteProps> = ({ children }) => {
  const { user, loading } = useAuth();
  const [isServiceProvider, setIsServiceProvider] = useState<boolean | null>(null);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const checkUserType = async () => {
      if (user) {
        const { data, error } = await supabase
          .from('profiles')
          .select('user_type')
          .eq('id', user.id)
          .single();

        if (error) {
          console.error('Error checking user type:', error);
          setIsServiceProvider(false);
        } else {
          setIsServiceProvider(data?.user_type === 'service_provider');
        }
      }
      setChecking(false);
    };

    if (!loading) {
      checkUserType();
    }
  }, [user, loading]);

  if (loading || checking) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-purple-900 flex items-center justify-center">
        <div className="text-white text-lg">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  if (!isServiceProvider) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

export default ServiceProviderRoute;
