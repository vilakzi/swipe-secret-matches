
import React from 'react';
import { MapPin } from 'lucide-react';
import OnlineStatus from '@/components/OnlineStatus';

interface ProfileInfoProps {
  name: string;
  age: number;
  location: string;
  bio: string;
  interests?: string[];
  isOnline: boolean;
  lineClampBio?: number;
}

const ProfileInfo: React.FC<ProfileInfoProps> = ({
  name,
  age,
  location,
  bio,
  interests,
  isOnline,
  lineClampBio = 2,
}) => (
  <div className="p-4 space-y-3">
    <div className="flex items-center justify-between">
      <h3 className="text-xl font-bold text-white">
        {name}, {age}
      </h3>
      <OnlineStatus isOnline={isOnline} size="sm" />
    </div>
    <div className="flex items-center text-gray-400 text-sm">
      <MapPin className="w-4 h-4 mr-1" aria-hidden="true" />
      {location}
    </div>
    <p className={`text-gray-300 text-sm ${lineClampBio > 0 ? `line-clamp-${lineClampBio}` : ''}`}>
      {bio}
    </p>
    {interests && interests.length > 0 && (
      <div className="flex flex-wrap gap-1">
        {interests.slice(0, 3).map((interest, index) => (
          <span
            key={index}
            className="bg-purple-600/20 text-purple-300 px-2 py-1 rounded-full text-xs"
          >
            {interest}
          </span>
        ))}
      </div>
    )}
  </div>
);

export default ProfileInfo;
