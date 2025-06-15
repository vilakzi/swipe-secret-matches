
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
      className={`${sizeClass} bg-cover bg-center relative flex items-center justify-center overflow-hidden`}
      style={{ backgroundImage: `url(${image})` }}
      role="img"
      aria-label={alt || `${name}'s profile photo`}
      tabIndex={0}
    >
      <img
        src={image}
        alt={alt || name}
        className="absolute inset-0 w-full h-full object-cover object-center"
        style={{ zIndex: 0, opacity: '0' }}
        aria-hidden="true"
        tabIndex={-1}
      />
      <div className="absolute top-2 left-2 z-10">
        <OnlineStatus
          isOnline={isOnline}
          size="md"
          className="bg-gray-900/50 rounded-full p-1"
        />
      </div>
      {/* Overlay children (badges, locks, overlays, etc) */}
      <div className="relative z-20 w-full h-full flex items-center justify-center">
        {children}
      </div>
    </div>
  );
};

export default ProfileImage;
