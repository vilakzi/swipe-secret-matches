
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { RefreshCw } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useEnhancedAuth } from '@/contexts/EnhancedAuthContext';
import { useUserRole } from '@/hooks/useUserRole';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import EnhancedFeedCard from './EnhancedFeedCard';
import FeedStats from './FeedStats';
import { toast } from '@/hooks/use-toast';

interface Profile {
  id: string;
  display_name: string | null;
  age: number | null;
  bio: string | null;
  location: string | null;
  profile_image_url: string | null;
  user_type: 'user' | 'service_provider' | 'admin' | 'superadmin' | null;
  created_at: string;
  whatsapp: string | null;
}

const WorkingFeed = () => {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useEnhancedAuth();
  const { role } = useUserRole();

  const fetchProfiles = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('Fetching profiles from Supabase...');
      const { data, error: fetchError } = await supabase
        .from('profiles')
        .select('*')
        .eq('is_blocked', false)
        .order('created_at', { ascending: false });

      if (fetchError) {
        console.error('Error fetching profiles:', fetchError);
        setError(fetchError.message);
        return;
      }

      console.log('Fetched profiles:', data?.length || 0);
      setProfiles(data || []);
    } catch (err) {
      console.error('Unexpected error:', err);
      setError('Failed to load profiles');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfiles();
  }, []);

  const filteredProfiles = profiles.filter(profile => {
    if (profile.id === user?.id) return false;
    
    if (role === 'admin') return true;
    if (role === 'user') return profile.user_type === 'service_provider';
    if (role === 'service_provider') return profile.user_type === 'user';
    
    return true;
  });

  const handleLike = async (profileId: string) => {
    toast({
      title: "Profile liked!",
      description: "Your like has been recorded",
    });
  };

  const handleContact = async (profile: Profile) => {
    if (profile.whatsapp) {
      window.open(`https://wa.me/${profile.whatsapp}`, '_blank');
    } else {
      toast({
        title: "Contact Info",
        description: "No contact information available for this profile",
        variant: "destructive",
      });
    }
  };

  // Calculate stats
  const serviceProviders = profiles.filter(p => p.user_type === 'service_provider').length;
  const newJoiners = profiles.filter(p => 
    new Date(p.created_at) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
  ).length;

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <LoadingSpinner size="lg" text="Loading your feed..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="bg-red-900/20 border border-red-700 rounded-lg p-6 max-w-md mx-auto">
          <h3 className="text-red-400 font-semibold mb-2">Error Loading Feed</h3>
          <p className="text-red-300 text-sm mb-4">{error}</p>
          <Button onClick={fetchProfiles} variant="outline" className="border-red-600 text-red-400 hover:bg-red-900/30">
            <RefreshCw className="w-4 h-4 mr-2" />
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Feed Stats */}
      <FeedStats 
        totalProfiles={profiles.length}
        serviceProviders={serviceProviders}
        newJoiners={newJoiners}
        userRole={role}
      />

      {/* Feed Header */}
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-white mb-2">
          {role === 'user' ? 'Service Providers' : role === 'service_provider' ? 'Users' : 'All Profiles'}
        </h2>
        <p className="text-gray-400">
          Showing {filteredProfiles.length} profiles 
          {role && ` (viewing as ${role})`}
        </p>
      </div>

      {/* Profiles Feed */}
      {filteredProfiles.length === 0 ? (
        <div className="text-center py-12">
          <div className="bg-gray-800 rounded-lg p-8 max-w-md mx-auto">
            <h3 className="text-white font-semibold mb-2">No Profiles Found</h3>
            <p className="text-gray-400 mb-6">
              {profiles.length === 0 
                ? "No profiles in the database yet."
                : `No ${role === 'user' ? 'service providers' : 'users'} found.`
              }
            </p>
            <Button onClick={fetchProfiles} className="bg-purple-600 hover:bg-purple-700">
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh Feed
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredProfiles.map((profile) => (
            <EnhancedFeedCard
              key={profile.id}
              profile={profile}
              onLike={handleLike}
              onContact={handleContact}
            />
          ))}
        </div>
      )}
      
      {/* Refresh Button */}
      <div className="text-center py-6">
        <Button 
          onClick={fetchProfiles} 
          variant="ghost" 
          className="text-purple-400 hover:text-purple-300 hover:bg-purple-900/20"
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh Feed
        </Button>
      </div>
    </div>
  );
};

export default WorkingFeed;
