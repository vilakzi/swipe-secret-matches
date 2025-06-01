
import React from 'react';
import { Badge } from '@/components/ui/badge';

interface InterestsStepProps {
  profileData: { interests: string[] };
  updateProfileData: (updates: any) => void;
}

const availableInterests = [
  'Travel', 'Photography', 'Music', 'Sports', 'Fitness', 'Cooking',
  'Art', 'Reading', 'Movies', 'Gaming', 'Dancing', 'Hiking',
  'Technology', 'Fashion', 'Food', 'Nature', 'Pets', 'Coffee',
  'Wine', 'Yoga', 'Meditation', 'Entrepreneur', 'Volunteering',
  'Languages', 'Culture', 'History', 'Science', 'Adventure'
];

const InterestsStep = ({ profileData, updateProfileData }: InterestsStepProps) => {
  const toggleInterest = (interest: string) => {
    const newInterests = profileData.interests.includes(interest)
      ? profileData.interests.filter(i => i !== interest)
      : [...profileData.interests, interest];
    
    updateProfileData({ interests: newInterests });
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <p className="text-gray-300 mb-4">
          Select your interests to help us find better matches for you.
        </p>
        <p className="text-sm text-gray-400">
          Choose at least 3 interests ({profileData.interests.length} selected)
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        {availableInterests.map((interest) => {
          const isSelected = profileData.interests.includes(interest);
          return (
            <Badge
              key={interest}
              variant={isSelected ? "default" : "outline"}
              className={`cursor-pointer transition-colors ${
                isSelected 
                  ? 'bg-purple-600 hover:bg-purple-700 text-white' 
                  : 'border-gray-600 text-gray-300 hover:bg-gray-700'
              }`}
              onClick={() => toggleInterest(interest)}
            >
              {interest}
            </Badge>
          );
        })}
      </div>

      <div className="bg-gray-800/50 rounded-lg p-4">
        <h4 className="text-white font-medium mb-2">Why interests matter:</h4>
        <ul className="text-sm text-gray-400 space-y-1">
          <li>• Help find people with common ground</li>
          <li>• Create better conversation starters</li>
          <li>• Improve match quality</li>
        </ul>
      </div>
    </div>
  );
};

export default InterestsStep;
