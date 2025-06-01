
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Camera, Save, Shield, Award, X, Plus } from 'lucide-react';
import VerificationBadges from './VerificationBadges';

interface ProfileEditorProps {
  profileData: any;
  onSave: (data: any) => void;
  onCancel: () => void;
}

const ProfileEditor = ({ profileData, onSave, onCancel }: ProfileEditorProps) => {
  const [formData, setFormData] = useState({
    ...profileData,
    interests: profileData.interests || [],
    privacySettings: profileData.privacySettings || {
      showOnlineStatus: true,
      showLastSeen: true,
      showLocation: true,
      showContact: false,
      allowMessages: true,
      profileVisibility: 'public'
    },
    verifications: profileData.verifications || {
      emailVerified: true,
      phoneVerified: false,
      photoVerified: false,
      locationVerified: false,
      premiumUser: false
    }
  });

  const [newInterest, setNewInterest] = useState('');

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handlePrivacyChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      privacySettings: {
        ...prev.privacySettings,
        [field]: value
      }
    }));
  };

  const addInterest = () => {
    if (newInterest.trim() && !formData.interests.includes(newInterest.trim())) {
      setFormData(prev => ({
        ...prev,
        interests: [...prev.interests, newInterest.trim()]
      }));
      setNewInterest('');
    }
  };

  const removeInterest = (interest: string) => {
    setFormData(prev => ({
      ...prev,
      interests: prev.interests.filter((i: string) => i !== interest)
    }));
  };

  const handleSave = () => {
    onSave(formData);
  };

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-white">Edit Profile</h1>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button onClick={handleSave} className="bg-purple-600 hover:bg-purple-700">
            <Save className="w-4 h-4 mr-2" />
            Save Changes
          </Button>
        </div>
      </div>

      <Tabs defaultValue="basic" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 bg-gray-800">
          <TabsTrigger value="basic">Basic Info</TabsTrigger>
          <TabsTrigger value="interests">Interests</TabsTrigger>
          <TabsTrigger value="privacy">Privacy</TabsTrigger>
          <TabsTrigger value="verification">Verification</TabsTrigger>
        </TabsList>

        <TabsContent value="basic" className="space-y-6">
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
                    onChange={(e) => handleInputChange('display_name', e.target.value)}
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
                    onChange={(e) => handleInputChange('age', parseInt(e.target.value) || null)}
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
                  onChange={(e) => handleInputChange('location', e.target.value)}
                  className="bg-gray-700 border-gray-600 text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Bio
                </label>
                <Textarea
                  value={formData.bio || ''}
                  onChange={(e) => handleInputChange('bio', e.target.value)}
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
                  onChange={(e) => handleInputChange('whatsapp', e.target.value)}
                  className="bg-gray-700 border-gray-600 text-white"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="interests" className="space-y-6">
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
        </TabsContent>

        <TabsContent value="privacy" className="space-y-6">
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <Shield className="w-5 h-5 mr-2" />
                Privacy Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="text-white font-medium mb-4">Profile Visibility</h3>
                <div className="space-y-3">
                  {[
                    { value: 'public', label: 'Public', desc: 'Anyone can see your profile' },
                    { value: 'friends', label: 'Connections Only', desc: 'Only matched users can see details' },
                    { value: 'private', label: 'Private', desc: 'Very limited profile visibility' }
                  ].map((option) => (
                    <label key={option.value} className="flex items-start space-x-3 cursor-pointer">
                      <input
                        type="radio"
                        name="profileVisibility"
                        value={option.value}
                        checked={formData.privacySettings.profileVisibility === option.value}
                        onChange={(e) => handlePrivacyChange('profileVisibility', e.target.value)}
                        className="mt-1"
                      />
                      <div>
                        <div className="text-white font-medium">{option.label}</div>
                        <div className="text-gray-400 text-sm">{option.desc}</div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-white font-medium mb-4">Information Sharing</h3>
                <div className="space-y-4">
                  {[
                    { key: 'showOnlineStatus', label: 'Show Online Status', desc: 'Let others see when you\'re online' },
                    { key: 'showLastSeen', label: 'Show Last Seen', desc: 'Display when you were last active' },
                    { key: 'showLocation', label: 'Show Location', desc: 'Display your city/location' },
                    { key: 'showContact', label: 'Show Contact Info', desc: 'Allow others to see your contact details' },
                    { key: 'allowMessages', label: 'Allow Messages', desc: 'Let matched users send you messages' }
                  ].map((setting) => (
                    <div key={setting.key} className="flex items-center justify-between">
                      <div>
                        <div className="text-white font-medium">{setting.label}</div>
                        <div className="text-gray-400 text-sm">{setting.desc}</div>
                      </div>
                      <Switch
                        checked={formData.privacySettings[setting.key]}
                        onCheckedChange={(checked) => handlePrivacyChange(setting.key, checked)}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="verification" className="space-y-6">
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <Award className="w-5 h-5 mr-2" />
                Verification Badges
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="mb-4">
                <h3 className="text-white font-medium mb-2">Current Verifications</h3>
                <VerificationBadges verifications={formData.verifications} size="md" />
              </div>

              <div className="space-y-4">
                <div className="bg-blue-800/20 border border-blue-600/30 rounded-lg p-4">
                  <h4 className="text-blue-400 font-medium mb-2">Email Verification</h4>
                  <p className="text-blue-300 text-sm mb-3">
                    {formData.verifications.emailVerified ? 
                      'Your email is verified!' : 
                      'Verify your email to increase trust with other users.'
                    }
                  </p>
                  {!formData.verifications.emailVerified && (
                    <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                      Verify Email
                    </Button>
                  )}
                </div>

                <div className="bg-green-800/20 border border-green-600/30 rounded-lg p-4">
                  <h4 className="text-green-400 font-medium mb-2">Phone Verification</h4>
                  <p className="text-green-300 text-sm mb-3">
                    {formData.verifications.phoneVerified ? 
                      'Your phone number is verified!' : 
                      'Verify your phone number for added security.'
                    }
                  </p>
                  {!formData.verifications.phoneVerified && (
                    <Button size="sm" className="bg-green-600 hover:bg-green-700">
                      Verify Phone
                    </Button>
                  )}
                </div>

                <div className="bg-purple-800/20 border border-purple-600/30 rounded-lg p-4">
                  <h4 className="text-purple-400 font-medium mb-2">Photo Verification</h4>
                  <p className="text-purple-300 text-sm mb-3">
                    {formData.verifications.photoVerified ? 
                      'Your photos are verified!' : 
                      'Verify your identity through photo verification.'
                    }
                  </p>
                  {!formData.verifications.photoVerified && (
                    <Button size="sm" className="bg-purple-600 hover:bg-purple-700">
                      Verify Photos
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ProfileEditor;
