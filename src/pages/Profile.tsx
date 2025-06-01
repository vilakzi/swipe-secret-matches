
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { ArrowLeft, Edit, Settings } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import ProfileEditor from '@/components/ProfileEditor';
import VerificationBadges from '@/components/VerificationBadges';

interface ProfileData {
  display_name: string;
  age: number | null;
  bio: string;
  location: string;
  whatsapp: string;
  profile_image_url: string | null;
  profile_images: string[];
  interests: string[];
  privacySettings: {
    showOnlineStatus: boolean;
    showLastSeen: boolean;
    showLocation: boolean;
    showContact: boolean;
    allowMessages: boolean;
    profileVisibility: 'public' | 'friends' | 'private';
  };
  verifications: {
    emailVerified: boolean;
    phoneVerified: boolean;
    photoVerified: boolean;
    locationVerified: boolean;
    premiumUser: boolean;
  };
}

const Profile = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(false);
  const [profileData, setProfileData] = useState<ProfileData>({
    display_name: '',
    age: null,
    bio: '',
    location: '',
    whatsapp: '',
    profile_image_url: null,
    profile_images: [],
    interests: [],
    privacySettings: {
      showOnlineStatus: true,
      showLastSeen: true,
      showLocation: true,
      showContact: false,
      allowMessages: true,
      profileVisibility: 'public'
    },
    verifications: {
      emailVerified: true,
      phoneVerified: false,
      photoVerified: false,
      locationVerified: false,
      premiumUser: false
    }
  });

  useEffect(() => {
    if (user) {
      fetchProfile();
    }
  }, [user]);

  const fetchProfile = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (data) {
        // Safely parse JSON fields with proper type casting and fallbacks
        const privacySettings = data.privacy_settings ? 
          (typeof data.privacy_settings === 'object' && data.privacy_settings !== null ? 
            data.privacy_settings as any : {}) : {};
            
        const verifications = data.verifications ? 
          (typeof data.verifications === 'object' && data.verifications !== null ? 
            data.verifications as any : {}) : {};

        setProfileData({
          display_name: data.display_name || '',
          age: data.age,
          bio: data.bio || '',
          location: data.location || '',
          whatsapp: data.whatsapp || '',
          profile_image_url: data.profile_image_url,
          profile_images: data.profile_images || [],
          interests: data.interests || [],
          privacySettings: {
            showOnlineStatus: privacySettings.showOnlineStatus ?? true,
            showLastSeen: privacySettings.showLastSeen ?? true,
            showLocation: privacySettings.showLocation ?? true,
            showContact: privacySettings.showContact ?? false,
            allowMessages: privacySettings.allowMessages ?? true,
            profileVisibility: privacySettings.profileVisibility ?? 'public'
          },
          verifications: {
            emailVerified: verifications.emailVerified ?? true,
            phoneVerified: verifications.phoneVerified ?? false,
            photoVerified: verifications.photoVerified ?? false,
            locationVerified: verifications.locationVerified ?? false,
            premiumUser: verifications.premiumUser ?? false
          }
        });
      }
    } catch (error: any) {
      toast({
        title: "Error loading profile",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const handleSave = async (data: ProfileData) => {
    if (!user) return;

    setLoading(true);

    try {
      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          display_name: data.display_name,
          age: data.age,
          bio: data.bio,
          location: data.location,
          whatsapp: data.whatsapp,
          profile_image_url: data.profile_image_url,
          profile_images: data.profile_images,
          interests: data.interests,
          privacy_settings: data.privacySettings,
          verifications: data.verifications,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;

      setProfileData(data);
      setEditing(false);

      toast({
        title: "Profile saved!",
        description: "Your profile has been updated successfully."
      });
    } catch (error: any) {
      toast({
        title: "Error saving profile",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  if (editing) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-purple-900 text-white p-4">
        <ProfileEditor
          profileData={profileData}
          onSave={handleSave}
          onCancel={() => setEditing(false)}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-purple-900 text-white p-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/')}
            className="text-white hover:bg-white/10"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <div className="flex space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setEditing(true)}
              className="text-white border-gray-600 hover:bg-white/10"
            >
              <Edit className="w-4 h-4 mr-2" />
              Edit Profile
            </Button>
          </div>
        </div>

        <Card className="bg-black/20 backdrop-blur-md border-gray-700">
          <CardHeader>
            <CardTitle className="text-white">Profile</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Profile Photo and Basic Info */}
            <div className="flex flex-col items-center space-y-4">
              <Avatar className="w-32 h-32">
                <AvatarImage 
                  src={profileData.profile_image_url || ''} 
                  className="object-cover"
                />
                <AvatarFallback className="bg-gray-600 text-white text-2xl">
                  {profileData.display_name ? profileData.display_name[0].toUpperCase() : 'U'}
                </AvatarFallback>
              </Avatar>
              
              <div className="text-center">
                <h2 className="text-2xl font-bold text-white">{profileData.display_name}</h2>
                {profileData.age && (
                  <p className="text-gray-400">{profileData.age} years old</p>
                )}
                {profileData.location && (
                  <p className="text-gray-400">{profileData.location}</p>
                )}
                
                <div className="mt-2">
                  <VerificationBadges verifications={profileData.verifications} size="md" />
                </div>
              </div>
            </div>

            {/* Bio */}
            {profileData.bio && (
              <div>
                <h3 className="text-white font-semibold mb-2">About</h3>
                <p className="text-gray-300">{profileData.bio}</p>
              </div>
            )}

            {/* Interests */}
            {profileData.interests.length > 0 && (
              <div>
                <h3 className="text-white font-semibold mb-2">Interests</h3>
                <div className="flex flex-wrap gap-2">
                  {profileData.interests.map((interest) => (
                    <span
                      key={interest}
                      className="bg-purple-600/20 text-purple-300 px-3 py-1 rounded-full text-sm"
                    >
                      {interest}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Additional Photos */}
            {profileData.profile_images && profileData.profile_images.length > 1 && (
              <div>
                <h3 className="text-white font-semibold mb-2">Photos</h3>
                <div className="grid grid-cols-3 gap-2">
                  {profileData.profile_images.slice(1).map((image, index) => (
                    <img
                      key={index}
                      src={image}
                      alt={`Profile ${index + 2}`}
                      className="w-full h-24 object-cover rounded"
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Privacy Status */}
            <div className="bg-gray-800/50 rounded-lg p-4">
              <h3 className="text-white font-semibold mb-2 flex items-center">
                <Settings className="w-4 h-4 mr-2" />
                Privacy Settings
              </h3>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="text-gray-400">
                  Profile: <span className="text-white capitalize">{profileData.privacySettings.profileVisibility}</span>
                </div>
                <div className="text-gray-400">
                  Messages: <span className="text-white">{profileData.privacySettings.allowMessages ? 'Enabled' : 'Disabled'}</span>
                </div>
                <div className="text-gray-400">
                  Online Status: <span className="text-white">{profileData.privacySettings.showOnlineStatus ? 'Visible' : 'Hidden'}</span>
                </div>
                <div className="text-gray-400">
                  Location: <span className="text-white">{profileData.privacySettings.showLocation ? 'Visible' : 'Hidden'}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Profile;
