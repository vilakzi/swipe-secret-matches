
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Shield } from 'lucide-react';
import { ProfileData } from '@/types/profile';

interface PrivacyTabProps {
  formData: ProfileData;
  onPrivacyChange: (field: string, value: any) => void;
}

const PrivacyTab = ({ formData, onPrivacyChange }: PrivacyTabProps) => {
  return (
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
                  onChange={(e) => onPrivacyChange('profileVisibility', e.target.value)}
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
                  checked={formData.privacySettings[setting.key as keyof typeof formData.privacySettings] as boolean}
                  onCheckedChange={(checked) => onPrivacyChange(setting.key, checked)}
                />
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PrivacyTab;
