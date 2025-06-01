
import React from 'react';
import { Textarea } from '@/components/ui/textarea';

interface BioStepProps {
  profileData: { bio: string };
  updateProfileData: (updates: any) => void;
}

const BioStep = ({ profileData, updateProfileData }: BioStepProps) => {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <p className="text-gray-300 mb-4">
          Tell others about yourself! What makes you unique? What are you looking for?
        </p>
      </div>

      <div>
        <Textarea
          value={profileData.bio}
          onChange={(e) => updateProfileData({ bio: e.target.value })}
          className="bg-gray-800 border-gray-600 text-white min-h-[120px]"
          placeholder="I love traveling, photography, and meeting new people. I'm passionate about..."
          maxLength={500}
        />
        <p className="text-xs text-gray-400 mt-2">
          {profileData.bio.length}/500 characters
        </p>
      </div>

      <div className="bg-gray-800/50 rounded-lg p-4">
        <h4 className="text-white font-medium mb-2">Tips for a great bio:</h4>
        <ul className="text-sm text-gray-400 space-y-1">
          <li>• Mention your interests and hobbies</li>
          <li>• Share what you're passionate about</li>
          <li>• Be authentic and positive</li>
          <li>• Keep it concise but engaging</li>
        </ul>
      </div>
    </div>
  );
};

export default BioStep;
