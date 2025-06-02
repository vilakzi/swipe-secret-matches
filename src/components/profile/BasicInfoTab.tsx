
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import PhotoUpload from './PhotoUpload';
import { ProfileData } from '@/types/profile';

interface BasicInfoTabProps {
  formData: ProfileData;
  onInputChange: (field: string, value: any) => void;
}

const BasicInfoTab = ({ formData, onInputChange }: BasicInfoTabProps) => {
  return (
    <div className="space-y-6">
      {/* Profile Photos */}
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white">Profile Photos</CardTitle>
        </CardHeader>
        <CardContent>
          <PhotoUpload
            photos={formData.profile_images}
            onPhotosChange={(photos) => {
              onInputChange('profile_images', photos);
              // Set the first photo as the main profile image
              if (photos.length > 0) {
                onInputChange('profile_image_url', photos[0]);
              } else {
                onInputChange('profile_image_url', null);
              }
            }}
            maxPhotos={6}
          />
        </CardContent>
      </Card>

      {/* Basic Information */}
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white">Basic Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="display_name" className="text-gray-300">Display Name</Label>
            <Input
              id="display_name"
              type="text"
              value={formData.display_name}
              onChange={(e) => onInputChange('display_name', e.target.value)}
              className="bg-gray-700 border-gray-600 text-white"
              placeholder="Enter your display name"
            />
          </div>

          <div>
            <Label htmlFor="age" className="text-gray-300">Age</Label>
            <Input
              id="age"
              type="number"
              value={formData.age || ''}
              onChange={(e) => onInputChange('age', e.target.value ? parseInt(e.target.value) : null)}
              className="bg-gray-700 border-gray-600 text-white"
              placeholder="Enter your age"
              min="18"
              max="100"
            />
          </div>

          <div>
            <Label htmlFor="location" className="text-gray-300">Location</Label>
            <Input
              id="location"
              type="text"
              value={formData.location}
              onChange={(e) => onInputChange('location', e.target.value)}
              className="bg-gray-700 border-gray-600 text-white"
              placeholder="City, Country"
            />
          </div>

          <div>
            <Label htmlFor="whatsapp" className="text-gray-300">WhatsApp Number</Label>
            <Input
              id="whatsapp"
              type="tel"
              value={formData.whatsapp}
              onChange={(e) => onInputChange('whatsapp', e.target.value)}
              className="bg-gray-700 border-gray-600 text-white"
              placeholder="+27 XX XXX XXXX"
            />
          </div>

          <div>
            <Label htmlFor="bio" className="text-gray-300">Bio</Label>
            <Textarea
              id="bio"
              value={formData.bio}
              onChange={(e) => onInputChange('bio', e.target.value)}
              className="bg-gray-700 border-gray-600 text-white"
              placeholder="Tell us about yourself..."
              rows={4}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default BasicInfoTab;
