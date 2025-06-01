
import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface PersonalInfoStepProps {
  profileData: { age: number | null; location: string };
  updateProfileData: (updates: any) => void;
}

const PersonalInfoStep = ({ profileData, updateProfileData }: PersonalInfoStepProps) => {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <p className="text-gray-300 mb-4">
          Help others get to know you better with some basic information.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <Label className="text-gray-300 mb-2">Age</Label>
          <Input
            type="number"
            value={profileData.age || ''}
            onChange={(e) => updateProfileData({ age: e.target.value ? Number(e.target.value) : null })}
            className="bg-gray-800 border-gray-600 text-white"
            placeholder="25"
            min="18"
            max="100"
          />
        </div>

        <div>
          <Label className="text-gray-300 mb-2">Location</Label>
          <Input
            value={profileData.location}
            onChange={(e) => updateProfileData({ location: e.target.value })}
            className="bg-gray-800 border-gray-600 text-white"
            placeholder="New York, NY"
          />
        </div>
      </div>

      <div className="bg-gray-800/50 rounded-lg p-4">
        <h4 className="text-white font-medium mb-2">Privacy Note:</h4>
        <p className="text-sm text-gray-400">
          Your exact location is never shared. Only the general area you specify will be visible to others.
        </p>
      </div>
    </div>
  );
};

export default PersonalInfoStep;
