
import React from 'react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Camera } from 'lucide-react';
import { ProfileData } from '@/types/profile';

interface BasicInfoTabProps {
  formData: ProfileData;
  onInputChange: (field: string, value: any) => void;
}

const BasicInfoTab = ({ formData, onInputChange }: BasicInfoTabProps) => {
  return (
    <Card className="bg-gray-800 border-gray-700">
      <CardHeader>
        <CardTitle className="text-white flex items-center">
          <Camera className="w-5 h-5 mr-2" />
          Basic Information
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Display Name
            </label>
            <Input
              value={formData.display_name || ''}
              onChange={(e) => onInputChange('display_name', e.target.value)}
              className="bg-gray-700 border-gray-600 text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Age
            </label>
            <Input
              type="number"
              value={formData.age || ''}
              onChange={(e) => onInputChange('age', parseInt(e.target.value) || null)}
              className="bg-gray-700 border-gray-600 text-white"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Location
          </label>
          <Input
            value={formData.location || ''}
            onChange={(e) => onInputChange('location', e.target.value)}
            className="bg-gray-700 border-gray-600 text-white"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Bio
          </label>
          <Textarea
            value={formData.bio || ''}
            onChange={(e) => onInputChange('bio', e.target.value)}
            className="bg-gray-700 border-gray-600 text-white min-h-[100px]"
            maxLength={500}
          />
          <p className="text-xs text-gray-400 mt-1">
            {(formData.bio || '').length}/500 characters
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            WhatsApp Number
          </label>
          <Input
            value={formData.whatsapp || ''}
            onChange={(e) => onInputChange('whatsapp', e.target.value)}
            className="bg-gray-700 border-gray-600 text-white"
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default BasicInfoTab;
