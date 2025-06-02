
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Star, MapPin, Phone, MessageCircle, Heart, Share } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import OnlineStatus from '@/components/OnlineStatus';
import { usePresence } from '@/hooks/usePresence';

interface UserData {
  id: string;
  display_name: string;
  bio: string;
  location: string;
  whatsapp: string;
  profile_image_url: string;
  profile_images: string[];
  age: number;
  gender: string;
  interests: string[];
}

const UserProfile = () => {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const { isUserOnline } = usePresence();
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (userId) {
      fetchUserData();
    }
  }, [userId]);

  const fetchUserData = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) throw error;
      setUser(data);
    } catch (error: any) {
      toast({
        title: "Error loading profile",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleContact = () => {
    if (user?.whatsapp) {
      const message = encodeURIComponent(`Hi ${user.display_name}! I saw your profile and would love to chat.`);
      window.open(`https://wa.me/${user.whatsapp.replace(/[^0-9]/g, '')}?text=${message}`, '_blank');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-purple-900 flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-purple-900 flex items-center justify-center">
        <div className="text-center text-white">
          <h2 className="text-2xl font-bold mb-4">User not found</h2>
          <Button onClick={() => navigate('/')} className="bg-purple-600 hover:bg-purple-700">
            Back to Feed
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-purple-900">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-black/80 backdrop-blur-md border-b border-gray-700">
        <div className="flex items-center justify-between p-4 max-w-4xl mx-auto">
          <Button
            onClick={() => navigate('/')}
            variant="ghost"
            className="text-white hover:bg-white/10"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <h1 className="text-xl font-bold text-white">{user.display_name}</h1>
          <div className="flex space-x-2">
            <Button
              onClick={handleContact}
              size="sm"
              className="bg-green-600 hover:bg-green-700"
            >
              <MessageCircle className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="sm" className="text-white">
              <Share className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-4 pt-8">
        {/* Profile Header */}
        <Card className="bg-black/20 backdrop-blur-md border-gray-700 mb-6">
          <CardContent className="p-6">
            <div className="flex items-start space-x-6">
              <div className="relative">
                <img
                  src={user.profile_image_url || '/placeholder.svg'}
                  alt={user.display_name}
                  className="w-32 h-32 rounded-full object-cover"
                />
                <OnlineStatus 
                  isOnline={isUserOnline(user.id)} 
                  size="lg"
                  className="absolute -bottom-2 -right-2"
                />
              </div>
              
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  <h1 className="text-3xl font-bold text-white">{user.display_name}</h1>
                  {user.age && (
                    <span className="text-2xl text-gray-300">{user.age}</span>
                  )}
                </div>

                {user.gender && (
                  <Badge className="bg-purple-600 text-white mb-3">
                    {user.gender}
                  </Badge>
                )}

                <div className="flex items-center text-gray-400 text-sm mb-4">
                  <MapPin className="w-4 h-4 mr-1" />
                  {user.location}
                </div>

                <div className="flex space-x-3">
                  <Button
                    onClick={handleContact}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <MessageCircle className="w-4 h-4 mr-2" />
                    Contact
                  </Button>
                  <Button variant="outline" className="border-gray-600 text-white hover:bg-white/10">
                    <Heart className="w-4 h-4 mr-2" />
                    Like
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* About Section */}
        <Card className="bg-black/20 backdrop-blur-md border-gray-700 mb-6">
          <CardHeader>
            <CardTitle className="text-white">About</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-300 mb-4">{user.bio || 'No bio available.'}</p>
            
            {/* Interests */}
            {user.interests && user.interests.length > 0 && (
              <div>
                <h3 className="text-white font-semibold mb-3">Interests</h3>
                <div className="flex flex-wrap gap-2">
                  {user.interests.map((interest, index) => (
                    <Badge key={index} variant="secondary" className="bg-purple-600/20 text-purple-300">
                      {interest}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Photos */}
        {user.profile_images && user.profile_images.length > 1 && (
          <Card className="bg-black/20 backdrop-blur-md border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">Photos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {user.profile_images.slice(1).map((image, index) => (
                  <img
                    key={index}
                    src={image}
                    alt={`${user.display_name} ${index + 2}`}
                    className="w-full h-48 object-cover rounded"
                  />
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default UserProfile;
