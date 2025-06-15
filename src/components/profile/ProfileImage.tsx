
import React from 'react';
import OnlineStatus from '@/components/OnlineStatus';

interface ProfileImageProps {
  image: string;
  name: string;
  isOnline: boolean;
  liked?: boolean;
  locked?: boolean;
  children?: React.ReactNode;
  alt?: string;
  sizeClass?: string;
}

const ProfileImage: React.FC<ProfileImageProps> = ({
  image,
  name,
  isOnline,
  liked,
  locked,
  children,
  alt,
  sizeClass = 'w-full h-64',
}) => {
  return (
    <div
      className={`${sizeClass} bg-cover bg-center relative`}
      style={{ backgroundImage: `url(${image})` }}
      role="img"
      aria-label={alt || `${name}'s profile photo`}
      tabIndex={0}
    >
      <div className="absolute top-2 left-2">
        <OnlineStatus
          isOnline={isOnline}
          size="md"
          className="bg-gray-900/50 rounded-full p-1"
        />
      </div>
      {/* Overlay children (badges, locks, overlays, etc) */}
      {children}
    </div>
  );
};

export default ProfileImage;
