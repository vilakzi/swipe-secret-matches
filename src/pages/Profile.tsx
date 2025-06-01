
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import ProfileEditor from '@/components/ProfileEditor';
import ProfileHeader from '@/components/profile/ProfileHeader';
import ProfileAvatar from '@/components/profile/ProfileAvatar';
import ProfileContent from '@/components/profile/ProfileContent';
import ProfilePrivacyStatus from '@/components/profile/ProfilePrivacyStatus';
import { useProfile } from '@/hooks/useProfile';

const Profile = () => {
  const [editing, setEditing] = useState(false);
  const { profileData, saveProfile } = useProfile();

  const handleSave = async (data: any) => {
    await saveProfile(data);
    setEditing(false);
  };

  if (editing) {
    return (
      <div className="min-h-screen text-white p-4">
        <ProfileEditor
          profileData={profileData}
          onSave={handleSave}
          onCancel={() => setEditing(false)}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen text-white p-4">
      <div className="max-w-2xl mx-auto">
        <ProfileHeader onEditClick={() => setEditing(true)} />

        <Card className="bg-black/20 backdrop-blur-md border-gray-700">
          <CardHeader>
            <CardTitle className="text-white">Profile</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <ProfileAvatar profileData={profileData} />
            <ProfileContent profileData={profileData} />
            <ProfilePrivacyStatus profileData={profileData} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Profile;
