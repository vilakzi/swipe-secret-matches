
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MapPin, Calendar, Heart, MessageCircle, Shield } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { RelationshipStatus } from '@/components/feed/types/feedTypes';

interface UserProfile {
  id: string;
  display_name: string;
  age: number;
  bio: string;
  location: string;
  profile_image_url: string;
  interests: string[];
  user_type: 'user' | 'service_provider';
  created_at: string;
  last_active: string;
  verifications: {
    emailVerified: boolean;
    phoneVerified: boolean;
    photoVerified: boolean;
    locationVerified: boolean;
    premiumUser: boolean;
  };
  privacy_settings: {
    showContact: boolean;
    showLastSeen: boolean;
    showLocation: boolean;
    profileVisibility: string;
  };
  relationship_status?: RelationshipStatus;
}

const UserProfile = () => {
  const { userId } = useParams<{ userId: string }>();
  const { user: currentUser } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isLiked, setIsLiked] = useState(false);

  useEffect(() => {
    if (userId) {
      fetchProfile();
      checkIfLiked();
    }
  }, [userId]);

  const fetchProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) throw error;
      
      setProfile(data);
    } catch (error: any) {
      console.error('Error fetching profile:', error);
      toast({
        title: "Error",
        description: "Failed to load profile",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const checkIfLiked = async () => {
    if (!currentUser || !userId) return;

    try {
      const { data } = await supabase
        .from('swipes')
        .select('liked')
        .eq('user_id', currentUser.id)
        .eq('target_user_id', userId)
        .single();

      setIsLiked(data?.liked || false);
    } catch (error) {
      // User hasn't swiped on this profile yet
      setIsLiked(false);
    }
  };

  const handleLike = async () => {
    if (!currentUser || !userId) return;

    try {
      const { error } = await supabase
        .from('swipes')
        .upsert({
          user_id: currentUser.id,
          target_user_id: userId,
          liked: !isLiked
        });

      if (error) throw error;

      setIsLiked(!isLiked);
      toast({
        title: isLiked ? "Like removed" : "Profile liked!",
        description: isLiked ? "You unliked this profile" : "Your like has been sent!",
      });
    } catch (error: any) {
      console.error('Error updating like:', error);
      toast({
        title: "Error",
        description: "Failed to update like",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-purple-900 flex items-center justify-center">
        <div className="text-white">Loading profile...</div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-purple-900 flex items-center justify-center">
        <div className="text-white">Profile not found</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-purple-900 p-4">
      <div className="max-w-4xl mx-auto">
        <Card className="bg-black/20 backdrop-blur-md border-gray-700">
          <CardHeader>
            <div className="flex items-start gap-6">
              <img
                src={profile.profile_image_url || '/placeholder.svg'}
                alt={profile.display_name}
                className="w-32 h-32 rounded-full object-cover border-4 border-purple-500"
              />
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <CardTitle className="text-2xl text-white">{profile.display_name}</CardTitle>
                  <Badge variant={profile.user_type === 'service_provider' ? 'default' : 'secondary'}>
                    {profile.user_type === 'service_provider' ? 'Service Provider' : 'User'}
                  </Badge>
                  {profile.verifications?.photoVerified && (
                    <Shield className="w-5 h-5 text-blue-500" />
                  )}
                </div>
                <p className="text-gray-300 mb-2">Age: {profile.age}</p>
                {profile.privacy_settings?.showLocation && profile.location && (
                  <div className="flex items-center gap-1 text-gray-300 mb-2">
                    <MapPin className="w-4 h-4" />
                    <span>{profile.location}</span>
                  </div>
                )}
                <div className="flex items-center gap-1 text-gray-300 mb-4">
                  <Calendar className="w-4 h-4" />
                  <span>Joined {new Date(profile.created_at).toLocaleDateString()}</span>
                </div>
                {currentUser && currentUser.id !== userId && (
                  <div className="flex gap-2">
                    <Button
                      onClick={handleLike}
                      variant={isLiked ? "destructive" : "default"}
                      className="flex items-center gap-2"
                    >
                      <Heart className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
                      {isLiked ? 'Unlike' : 'Like'}
                    </Button>
                    <Button variant="outline" className="text-white border-white/20">
                      <MessageCircle className="w-4 h-4 mr-2" />
                      Message
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {profile.bio && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-white mb-2">About</h3>
                <p className="text-gray-300">{profile.bio}</p>
              </div>
            )}
            
            {profile.interests && profile.interests.length > 0 && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-white mb-2">Interests</h3>
                <div className="flex flex-wrap gap-2">
                  {profile.interests.map((interest, index) => (
                    <Badge key={index} variant="outline" className="text-gray-300 border-gray-600">
                      {interest}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">Verifications</h3>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${profile.verifications?.emailVerified ? 'bg-green-500' : 'bg-gray-500'}`} />
                    <span className="text-gray-300">Email Verified</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${profile.verifications?.phoneVerified ? 'bg-green-500' : 'bg-gray-500'}`} />
                    <span className="text-gray-300">Phone Verified</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${profile.verifications?.photoVerified ? 'bg-green-500' : 'bg-gray-500'}`} />
                    <span className="text-gray-300">Photo Verified</span>
                  </div>
                </div>
              </div>
              
              {profile.privacy_settings?.showLastSeen && (
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">Activity</h3>
                  <p className="text-gray-300">
                    Last active: {new Date(profile.last_active).toLocaleDateString()}
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default UserProfile;
