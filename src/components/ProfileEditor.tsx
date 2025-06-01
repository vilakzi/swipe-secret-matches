
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ProfileEditorHeader from '@/components/profile/ProfileEditorHeader';
import BasicInfoTab from '@/components/profile/BasicInfoTab';
import InterestsTab from '@/components/profile/InterestsTab';
import PrivacyTab from '@/components/profile/PrivacyTab';
import VerificationTab from '@/components/profile/VerificationTab';
import { ProfileData } from '@/types/profile';

interface ProfileEditorProps {
  profileData: ProfileData;
  onSave: (data: ProfileData) => void;
  onCancel: () => void;
}

const ProfileEditor = ({ profileData, onSave, onCancel }: ProfileEditorProps) => {
  const [formData, setFormData] = useState<ProfileData>({
    ...profileData,
    interests: profileData.interests || [],
    privacySettings: profileData.privacySettings || {
      showOnlineStatus: true,
      showLastSeen: true,
      showLocation: true,
      showContact: false,
      allowMessages: true,
      profileVisibility: 'public'
    },
    verifications: profileData.verifications || {
      emailVerified: true,
      phoneVerified: false,
      photoVerified: false,
      locationVerified: false,
      premiumUser: false
    }
  });

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handlePrivacyChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      privacySettings: {
        ...prev.privacySettings,
        [field]: value
      }
    }));
  };

  const handleSave = () => {
    onSave(formData);
  };

  return (
    <div className="max-w-4xl mx-auto p-4">
      <ProfileEditorHeader onSave={handleSave} onCancel={onCancel} />

      <Tabs defaultValue="basic" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 bg-gray-800">
          <TabsTrigger value="basic">Basic Info</TabsTrigger>
          <TabsTrigger value="interests">Interests</TabsTrigger>
          <TabsTrigger value="privacy">Privacy</TabsTrigger>
          <TabsTrigger value="verification">Verification</TabsTrigger>
        </TabsList>

        <TabsContent value="basic" className="space-y-6">
          <BasicInfoTab formData={formData} onInputChange={handleInputChange} />
        </TabsContent>

        <TabsContent value="interests" className="space-y-6">
          <InterestsTab formData={formData} onInputChange={handleInputChange} />
        </TabsContent>

        <TabsContent value="privacy" className="space-y-6">
          <PrivacyTab formData={formData} onPrivacyChange={handlePrivacyChange} />
        </TabsContent>

        <TabsContent value="verification" className="space-y-6">
          <VerificationTab formData={formData} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ProfileEditor;
