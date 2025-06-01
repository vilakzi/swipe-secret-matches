
import React from 'react';
import { ProfileData } from '@/types/profile';

interface ProfileContentProps {
  profileData: ProfileData;
}

const ProfileContent = ({ profileData }: ProfileContentProps) => {
  return (
    <div className="space-y-6">
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
    </div>
  );
};

export default ProfileContent;
