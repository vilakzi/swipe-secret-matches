
import { useState, useEffect } from 'react';
import { useEnhancedAuth } from '@/contexts/EnhancedAuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { ProfileData } from '@/types/profile';

export const useProfile = () => {
  const { user } = useEnhancedAuth();
  const [loading, setLoading] = useState(false);
  const [profileData, setProfileData] = useState<ProfileData>({
    display_name: '',
    age: null,
    bio: '',
    location: '',
    whatsapp: '',
    phone: '',
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
          phone: data.phone || '',
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

  const saveProfile = async (data: ProfileData) => {
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
          phone: data.phone,
          profile_image_url: data.profile_image_url,
          profile_images: data.profile_images,
          interests: data.interests,
          privacy_settings: data.privacySettings,
          verifications: data.verifications,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;

      setProfileData(data);

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

  return {
    profileData,
    setProfileData,
    loading,
    saveProfile,
    refetch: fetchProfile
  };
};
