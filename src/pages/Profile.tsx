
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Camera, Save, ArrowLeft, Upload } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface ProfileData {
  display_name: string;
  age: number | null;
  bio: string;
  location: string;
  whatsapp: string;
  profile_image_url: string | null;
}

const Profile = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [profileData, setProfileData] = useState<ProfileData>({
    display_name: '',
    age: null,
    bio: '',
    location: '',
    whatsapp: '',
    profile_image_url: null
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
        setProfileData({
          display_name: data.display_name || '',
          age: data.age,
          bio: data.bio || '',
          location: data.location || '',
          whatsapp: data.whatsapp || '',
          profile_image_url: data.profile_image_url
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

  const handleInputChange = (field: keyof ProfileData, value: string | number) => {
    setProfileData(prev => ({
      ...prev,
      [field]: field === 'age' ? (value === '' ? null : Number(value)) : value
    }));
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    setUploading(true);

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/profile.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('profiles')
        .upload(fileName, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('profiles')
        .getPublicUrl(fileName);

      setProfileData(prev => ({
        ...prev,
        profile_image_url: publicUrl
      }));

      toast({
        title: "Photo uploaded!",
        description: "Your profile photo has been updated."
      });
    } catch (error: any) {
      toast({
        title: "Upload failed",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    if (!user) return;

    setLoading(true);

    try {
      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          display_name: profileData.display_name,
          age: profileData.age,
          bio: profileData.bio,
          location: profileData.location,
          whatsapp: profileData.whatsapp,
          profile_image_url: profileData.profile_image_url,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;

      toast({
        title: "Profile saved!",
        description: "Your profile has been updated successfully."
      });

      navigate('/');
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-purple-900 text-white p-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center mb-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/')}
            className="text-white hover:bg-white/10 mr-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <h1 className="text-2xl font-bold">Edit Profile</h1>
        </div>

        <Card className="bg-black/20 backdrop-blur-md border-gray-700">
          <CardHeader>
            <CardTitle className="text-white">Profile Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Profile Photo */}
            <div className="flex flex-col items-center space-y-4">
              <div className="relative">
                <Avatar className="w-32 h-32">
                  <AvatarImage 
                    src={profileData.profile_image_url || ''} 
                    className="object-cover"
                  />
                  <AvatarFallback className="bg-gray-600 text-white text-2xl">
                    {profileData.display_name ? profileData.display_name[0].toUpperCase() : 'U'}
                  </AvatarFallback>
                </Avatar>
                <label className="absolute bottom-0 right-0 bg-purple-600 hover:bg-purple-700 p-2 rounded-full cursor-pointer transition-colors">
                  <Camera className="w-4 h-4" />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                    disabled={uploading}
                  />
                </label>
              </div>
              {uploading && (
                <p className="text-sm text-gray-400 flex items-center">
                  <Upload className="w-4 h-4 mr-2 animate-spin" />
                  Uploading photo...
                </p>
              )}
            </div>

            {/* Form Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Display Name *
                </label>
                <Input
                  value={profileData.display_name}
                  onChange={(e) => handleInputChange('display_name', e.target.value)}
                  className="bg-gray-800 border-gray-600 text-white"
                  placeholder="Your display name"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Age
                </label>
                <Input
                  type="number"
                  value={profileData.age || ''}
                  onChange={(e) => handleInputChange('age', e.target.value)}
                  className="bg-gray-800 border-gray-600 text-white"
                  placeholder="Your age"
                  min="18"
                  max="100"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Location
              </label>
              <Input
                value={profileData.location}
                onChange={(e) => handleInputChange('location', e.target.value)}
                className="bg-gray-800 border-gray-600 text-white"
                placeholder="Your location"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                WhatsApp Number
              </label>
              <Input
                value={profileData.whatsapp}
                onChange={(e) => handleInputChange('whatsapp', e.target.value)}
                className="bg-gray-800 border-gray-600 text-white"
                placeholder="Your WhatsApp number"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Bio
              </label>
              <Textarea
                value={profileData.bio}
                onChange={(e) => handleInputChange('bio', e.target.value)}
                className="bg-gray-800 border-gray-600 text-white min-h-[100px]"
                placeholder="Tell us about yourself..."
                maxLength={500}
              />
              <p className="text-xs text-gray-400 mt-1">
                {profileData.bio.length}/500 characters
              </p>
            </div>

            {/* Save Button */}
            <Button
              onClick={handleSave}
              disabled={loading || !profileData.display_name.trim()}
              className="w-full bg-purple-600 hover:bg-purple-700"
            >
              {loading ? (
                <>
                  <Upload className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Save Profile
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Profile;
