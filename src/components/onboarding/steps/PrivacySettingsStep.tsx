
import React from 'react';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent } from '@/components/ui/card';
import { Shield, Eye, MapPin, Phone, Mail } from 'lucide-react';

interface PrivacySettingsStepProps {
  profileData: {
    privacySettings: {
      showOnlineStatus: boolean;
      showLastSeen: boolean;
      showLocation: boolean;
      showContact: boolean;
      allowMessages: boolean;
      profileVisibility: 'public' | 'friends' | 'private';
    };
  };
  updateProfileData: (updates: any) => void;
}

const PrivacySettingsStep = ({ profileData, updateProfileData }: PrivacySettingsStepProps) => {
  const updatePrivacySetting = (key: string, value: boolean | string) => {
    updateProfileData({
      privacySettings: {
        ...profileData.privacySettings,
        [key]: value
      }
    });
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <Shield className="w-12 h-12 text-purple-400 mx-auto mb-4" />
        <p className="text-gray-300 mb-4">
          Control who can see your information and how others can interact with you.
        </p>
      </div>

      {/* Profile Visibility */}
      <Card className="bg-gray-800/50 border-gray-700">
        <CardContent className="p-4 space-y-4">
          <h3 className="text-white font-semibold flex items-center">
            <Eye className="w-5 h-5 mr-2" />
            Profile Visibility
          </h3>
          
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
                  checked={profileData.privacySettings.profileVisibility === option.value}
                  onChange={(e) => updatePrivacySetting('profileVisibility', e.target.value)}
                  className="mt-1"
                />
                <div>
                  <div className="text-white font-medium">{option.label}</div>
                  <div className="text-gray-400 text-sm">{option.desc}</div>
                </div>
              </label>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Information Sharing */}
      <Card className="bg-gray-800/50 border-gray-700">
        <CardContent className="p-4 space-y-4">
          <h3 className="text-white font-semibold">Information Sharing</h3>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-green-600/20 rounded-full flex items-center justify-center">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                </div>
                <div>
                  <div className="text-white font-medium">Show Online Status</div>
                  <div className="text-gray-400 text-sm">Let others see when you're online</div>
                </div>
              </div>
              <Switch
                checked={profileData.privacySettings.showOnlineStatus}
                onCheckedChange={(checked) => updatePrivacySetting('showOnlineStatus', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Eye className="w-5 h-5 text-blue-400" />
                <div>
                  <div className="text-white font-medium">Show Last Seen</div>
                  <div className="text-gray-400 text-sm">Display when you were last active</div>
                </div>
              </div>
              <Switch
                checked={profileData.privacySettings.showLastSeen}
                onCheckedChange={(checked) => updatePrivacySetting('showLastSeen', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <MapPin className="w-5 h-5 text-red-400" />
                <div>
                  <div className="text-white font-medium">Show Location</div>
                  <div className="text-gray-400 text-sm">Display your city/location</div>
                </div>
              </div>
              <Switch
                checked={profileData.privacySettings.showLocation}
                onCheckedChange={(checked) => updatePrivacySetting('showLocation', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Phone className="w-5 h-5 text-purple-400" />
                <div>
                  <div className="text-white font-medium">Show Contact Info</div>
                  <div className="text-gray-400 text-sm">Allow others to see your contact details</div>
                </div>
              </div>
              <Switch
                checked={profileData.privacySettings.showContact}
                onCheckedChange={(checked) => updatePrivacySetting('showContact', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Mail className="w-5 h-5 text-yellow-400" />
                <div>
                  <div className="text-white font-medium">Allow Messages</div>
                  <div className="text-gray-400 text-sm">Let matched users send you messages</div>
                </div>
              </div>
              <Switch
                checked={profileData.privacySettings.allowMessages}
                onCheckedChange={(checked) => updatePrivacySetting('allowMessages', checked)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="bg-yellow-800/20 border border-yellow-600/30 rounded-lg p-4">
        <h4 className="text-yellow-400 font-medium mb-2">Privacy Tip</h4>
        <p className="text-yellow-300 text-sm">
          You can always change these settings later in your profile. Start with settings you're comfortable with.
        </p>
      </div>
    </div>
  );
};

export default PrivacySettingsStep;
