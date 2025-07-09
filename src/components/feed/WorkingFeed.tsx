
import React, { useState, useEffect } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Heart, MessageCircle, User, MapPin, Calendar } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useEnhancedAuth } from '@/contexts/EnhancedAuthContext';
import { useUserRole } from '@/hooks/useUserRole';
import LoadingSpinner from '@/components/common/LoadingSpinner';
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
    // Don't show current user's profile
    if (profile.id === user?.id) return false;
    
    // Role-based filtering
    if (role === 'admin') return true; // Admins see all
    if (role === 'user') return profile.user_type === 'service_provider'; // Users see providers
    if (role === 'service_provider') return profile.user_type === 'user'; // Providers see users
    
    return true;
  });

  const handleLike = async (profileId: string) => {
    toast({
      title: "Liked!",
      description: "You liked this profile",
    });
  };

  const handleContact = async (profile: Profile) => {
    if (profile.whatsapp) {
      window.open(`https://wa.me/${profile.whatsapp}`, '_blank');
    } else {
      toast({
        title: "Contact Info",
        description: "No contact information available",
      });
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <LoadingSpinner size="md" text="Loading profiles..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <div className="bg-red-900/20 border border-red-700 rounded-lg p-4 max-w-md mx-auto">
          <h3 className="text-red-400 font-semibold mb-2">Error Loading Profiles</h3>
          <p className="text-red-300 text-sm mb-4">{error}</p>
          <Button onClick={fetchProfiles} variant="outline" className="border-red-600 text-red-400">
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  if (filteredProfiles.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="bg-gray-800 rounded-lg p-6">
          <User className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-white font-semibold mb-2">No Profiles Found</h3>
          <p className="text-gray-400 mb-4">
            {profiles.length === 0 
              ? "No profiles in the database yet."
              : `No ${role === 'user' ? 'service providers' : 'users'} found.`
            }
          </p>
          <Button onClick={fetchProfiles} variant="outline">
            Refresh
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      <div className="text-center mb-6">
        <h2 className="text-xl font-bold text-white mb-2">Your Feed</h2>
        <p className="text-gray-400 text-sm">
          Showing {filteredProfiles.length} profiles 
          {role && ` (viewing as ${role})`}
        </p>
      </div>

      {filteredProfiles.map((profile) => (
        <Card key={profile.id} className="bg-gray-800 border-gray-700 p-6">
          <div className="flex items-start space-x-4">
            <div className="w-16 h-16 rounded-full bg-gray-700 flex items-center justify-center overflow-hidden">
              {profile.profile_image_url ? (
                <img
                  src={profile.profile_image_url}
                  alt={profile.display_name || 'Profile'}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/placeholder.svg';
                  }}
                />
              ) : (
                <User className="w-8 h-8 text-gray-400" />
              )}
            </div>
            
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-white">
                {profile.display_name || 'Anonymous User'}
              </h3>
              
              <div className="flex items-center space-x-4 text-sm text-gray-400 mb-2">
                {profile.age && <span>Age: {profile.age}</span>}
                {profile.location && (
                  <span className="flex items-center">
                    <MapPin className="w-3 h-3 mr-1" />
                    {profile.location}
                  </span>
                )}
                <span className="flex items-center">
                  <Calendar className="w-3 h-3 mr-1" />
                  {new Date(profile.created_at).toLocaleDateString()}
                </span>
              </div>
              
              <p className="text-sm text-gray-400 mb-2">
                Type: {profile.user_type || 'user'}
              </p>
              
              {profile.bio && (
                <p className="text-sm text-gray-300 mb-4">{profile.bio}</p>
              )}
              
              <div className="flex space-x-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleLike(profile.id)}
                  className="flex items-center space-x-1"
                >
                  <Heart className="w-4 h-4" />
                  <span>Like</span>
                </Button>
                
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleContact(profile)}
                  className="flex items-center space-x-1"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>Contact</span>
                </Button>
              </div>
            </div>
          </div>
        </Card>
      ))}
      
      <div className="text-center py-4">
        <Button onClick={fetchProfiles} variant="ghost" className="text-purple-400">
          Refresh Feed
        </Button>
      </div>
    </div>
  );
};

export default WorkingFeed;
