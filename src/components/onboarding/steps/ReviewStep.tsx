
import React from 'react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { MapPin, User, Calendar } from 'lucide-react';

interface ReviewStepProps {
  profileData: {
    photos: string[];
    bio: string;
    age: number | null;
    location: string;
    interests: string[];
  };
  updateProfileData: (updates: any) => void;
}

const ReviewStep = ({ profileData }: ReviewStepProps) => {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <p className="text-gray-300 mb-4">
          Review your profile before publishing. You can always edit it later.
        </p>
      </div>

      {/* Profile Preview */}
      <div className="bg-gray-800/50 rounded-lg p-6">
        <div className="flex items-start space-x-4 mb-4">
          <Avatar className="w-20 h-20">
            <AvatarImage src={profileData.photos[0]} className="object-cover" />
            <AvatarFallback className="bg-gray-600 text-white text-xl">
              <User className="w-8 h-8" />
            </AvatarFallback>
          </Avatar>

          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-2">
              {profileData.age && (
                <div className="flex items-center text-gray-300">
                  <Calendar className="w-4 h-4 mr-1" />
                  {profileData.age} years old
                </div>
              )}
              {profileData.location && (
                <div className="flex items-center text-gray-300">
                  <MapPin className="w-4 h-4 mr-1" />
                  {profileData.location}
                </div>
              )}
            </div>
          </div>
        </div>

        {profileData.bio && (
          <div className="mb-4">
            <h4 className="text-white font-medium mb-2">About</h4>
            <p className="text-gray-300 text-sm">{profileData.bio}</p>
          </div>
        )}

        {profileData.interests.length > 0 && (
          <div className="mb-4">
            <h4 className="text-white font-medium mb-2">Interests</h4>
            <div className="flex flex-wrap gap-2">
              {profileData.interests.map((interest) => (
                <Badge key={interest} variant="outline" className="border-gray-600 text-gray-300">
                  {interest}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {profileData.photos.length > 1 && (
          <div>
            <h4 className="text-white font-medium mb-2">Photos ({profileData.photos.length})</h4>
            <div className="flex space-x-2 overflow-x-auto">
              {profileData.photos.slice(1).map((photo, index) => (
                <img
                  key={index}
                  src={photo}
                  alt={`Profile ${index + 2}`}
                  className="w-16 h-16 object-cover rounded-lg flex-shrink-0"
                />
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="bg-green-800/20 border border-green-600/30 rounded-lg p-4">
        <h4 className="text-green-400 font-medium mb-2">Ready to go live!</h4>
        <p className="text-green-300 text-sm">
          Your profile looks great! Click "Complete Profile" to publish and start connecting with others.
        </p>
      </div>
    </div>
  );
};

export default ReviewStep;
