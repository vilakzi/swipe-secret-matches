
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { X, Plus } from 'lucide-react';
import { ProfileData } from '@/types/profile';

interface InterestsTabProps {
  formData: ProfileData;
  onInputChange: (field: string, value: any) => void;
}

const InterestsTab = ({ formData, onInputChange }: InterestsTabProps) => {
  const [newInterest, setNewInterest] = useState('');

  const addInterest = () => {
    if (newInterest.trim() && !formData.interests.includes(newInterest.trim())) {
      onInputChange('interests', [...formData.interests, newInterest.trim()]);
      setNewInterest('');
    }
  };

  const removeInterest = (interest: string) => {
    onInputChange('interests', formData.interests.filter((i: string) => i !== interest));
  };

  return (
    <Card className="bg-gray-800 border-gray-700">
      <CardHeader>
        <CardTitle className="text-white">Interests & Tags</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex space-x-2">
          <Input
            value={newInterest}
            onChange={(e) => setNewInterest(e.target.value)}
            placeholder="Add an interest..."
            className="bg-gray-700 border-gray-600 text-white"
            onKeyPress={(e) => e.key === 'Enter' && addInterest()}
          />
          <Button onClick={addInterest} size="sm">
            <Plus className="w-4 h-4" />
          </Button>
        </div>

        <div className="flex flex-wrap gap-2">
          {formData.interests.map((interest: string) => (
            <Badge
              key={interest}
              variant="outline"
              className="border-gray-600 text-gray-300 flex items-center space-x-1"
            >
              <span>{interest}</span>
              <button
                onClick={() => removeInterest(interest)}
                className="ml-1 hover:text-red-400"
              >
                <X className="w-3 h-3" />
              </button>
            </Badge>
          ))}
        </div>

        {formData.interests.length === 0 && (
          <p className="text-gray-400 text-sm">No interests added yet. Add some to help others find you!</p>
        )}
      </CardContent>
    </Card>
  );
};

export default InterestsTab;
