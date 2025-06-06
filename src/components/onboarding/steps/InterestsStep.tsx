
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { useUserRole } from '@/hooks/useUserRole';

interface InterestsStepProps {
  profileData: { interests: string[] };
  updateProfileData: (updates: any) => void;
}

const regularInterests = [
  'Travel', 'Photography', 'Music', 'Sports', 'Fitness', 'Cooking',
  'Art', 'Reading', 'Movies', 'Gaming', 'Dancing', 'Hiking',
  'Technology', 'Fashion', 'Food', 'Nature', 'Pets', 'Coffee',
  'Wine', 'Yoga', 'Meditation', 'Entrepreneur', 'Volunteering',
  'Languages', 'Culture', 'History', 'Science', 'Adventure'
];

const providerInterests = [
  'Companionship', 'Entertainment', 'Events', 'Massage', 'Personal Training',
  'Coaching', 'Consultation', 'Photography Services', 'Travel Companion',
  'Social Events', 'Private Sessions', 'Custom Content', 'Virtual Services',
  'Premium Chat', 'Exclusive Content', 'Adult Entertainment', 'Hook-ups',
  'Intimate Services', 'NSFW Content', 'Adult Modeling', 'Custom Videos',
  'Private Shows', 'Adult Consultation'
];

const InterestsStep = ({ profileData, updateProfileData }: InterestsStepProps) => {
  const { isServiceProvider } = useUserRole();
  
  const availableInterests = isServiceProvider ? providerInterests : regularInterests;
  
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
          {isServiceProvider 
            ? "Select the services and content types you offer to help clients find you."
            : "Select your interests to help us find better matches for you."
          }
        </p>
        <p className="text-sm text-gray-400">
          Choose at least 3 {isServiceProvider ? 'services' : 'interests'} ({profileData.interests.length} selected)
        </p>
      </div>

      {isServiceProvider && (
        <div className="bg-red-900/30 border border-red-500 rounded-lg p-3 mb-4">
          <p className="text-red-300 text-xs font-medium">
            ⚠️ Adult Content: Some options relate to adult services. Ensure compliance with local laws.
          </p>
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        {availableInterests.map((interest) => {
          const isSelected = profileData.interests.includes(interest);
          const isAdultContent = ['Hook-ups', 'Intimate Services', 'NSFW Content', 'Adult Entertainment', 'Adult Modeling', 'Custom Videos', 'Private Shows', 'Adult Consultation'].includes(interest);
          
          return (
            <Badge
              key={interest}
              variant={isSelected ? "default" : "outline"}
              className={`cursor-pointer transition-colors ${
                isSelected 
                  ? (isAdultContent ? 'bg-red-600 hover:bg-red-700 text-white' : 'bg-purple-600 hover:bg-purple-700 text-white')
                  : 'border-gray-600 text-gray-300 hover:bg-gray-700'
              }`}
              onClick={() => toggleInterest(interest)}
            >
              {interest}
              {isAdultContent && ' 🔞'}
            </Badge>
          );
        })}
      </div>

      <div className="bg-gray-800/50 rounded-lg p-4">
        <h4 className="text-white font-medium mb-2">
          {isServiceProvider ? 'Why service categories matter:' : 'Why interests matter:'}
        </h4>
        <ul className="text-sm text-gray-400 space-y-1">
          {isServiceProvider ? (
            <>
              <li>• Help clients find the right services</li>
              <li>• Increase booking opportunities</li>
              <li>• Attract your target audience</li>
            </>
          ) : (
            <>
              <li>• Help find people with common ground</li>
              <li>• Create better conversation starters</li>
              <li>• Improve match quality</li>
            </>
          )}
        </ul>
      </div>
    </div>
  );
};

export default InterestsStep;
