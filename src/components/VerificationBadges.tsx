
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Shield, CheckCircle, Star, Camera, MapPin } from 'lucide-react';

interface VerificationBadgesProps {
  verifications: {
    phoneVerified?: boolean;
    emailVerified?: boolean;
    photoVerified?: boolean;
    locationVerified?: boolean;
    premiumUser?: boolean;
  };
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

const VerificationBadges = ({ verifications, className = '', size = 'sm' }: VerificationBadgesProps) => {
  // Safety check to prevent errors if verifications is undefined
  if (!verifications) {
    return null;
  }

  const badges = [
    {
      key: 'emailVerified',
      icon: CheckCircle,
      label: 'Email',
      color: 'bg-green-600',
      textColor: 'text-green-100'
    },
    {
      key: 'phoneVerified',
      icon: Shield,
      label: 'Phone',
      color: 'bg-blue-600',
      textColor: 'text-blue-100'
    },
    {
      key: 'photoVerified',
      icon: Camera,
      label: 'Photo',
      color: 'bg-purple-600',
      textColor: 'text-purple-100'
    },
    {
      key: 'locationVerified',
      icon: MapPin,
      label: 'Location',
      color: 'bg-orange-600',
      textColor: 'text-orange-100'
    },
    {
      key: 'premiumUser',
      icon: Star,
      label: 'Premium',
      color: 'bg-yellow-600',
      textColor: 'text-yellow-100'
    }
  ];

  const iconSize = size === 'sm' ? 'w-3 h-3' : size === 'md' ? 'w-4 h-4' : 'w-5 h-5';
  const textSize = size === 'sm' ? 'text-xs' : size === 'md' ? 'text-sm' : 'text-base';

  const verifiedBadges = badges.filter(badge => verifications[badge.key as keyof typeof verifications]);

  if (verifiedBadges.length === 0) return null;

  return (
    <div className={`flex flex-wrap gap-1 ${className}`}>
      {verifiedBadges.map((badge) => {
        const IconComponent = badge.icon;
        return (
          <Badge
            key={badge.key}
            className={`${badge.color} ${badge.textColor} ${textSize} flex items-center space-x-1 px-2 py-1`}
          >
            <IconComponent className={iconSize} />
            <span>{badge.label}</span>
          </Badge>
        );
      })}
    </div>
  );
};

export default VerificationBadges;
