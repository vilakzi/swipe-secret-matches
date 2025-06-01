
import React from 'react';
import { Settings } from 'lucide-react';
import { ProfileData } from '@/types/profile';

interface ProfilePrivacyStatusProps {
  profileData: ProfileData;
}

const ProfilePrivacyStatus = ({ profileData }: ProfilePrivacyStatusProps) => {
  return (
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
  );
};

export default ProfilePrivacyStatus;
