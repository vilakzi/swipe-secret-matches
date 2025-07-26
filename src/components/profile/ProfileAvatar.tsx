
import React from 'react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import VerificationBadges from '@/components/VerificationBadges';
import { ProfileData } from '@/types/profile';

interface ProfileAvatarProps {
  profileData: ProfileData;
}

const ProfileAvatar = ({ profileData }: ProfileAvatarProps) => {
  return (
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
        
        <div className="mt-2">
          <VerificationBadges verifications={profileData.verifications} size="md" />
        </div>
      </div>
    </div>
  );
};

export default ProfileAvatar;
