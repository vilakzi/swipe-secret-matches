
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Shield, Eye, Lock } from 'lucide-react';
import { ProfileData } from '@/types/profile';

interface PrivacyTabProps {
  formData: ProfileData;
  onPrivacyChange: (field: string, value: any) => void;
}

const PrivacyTab = ({ formData, onPrivacyChange }: PrivacyTabProps) => {
  const profileVisibility = formData.privacySettings.profileVisibility;

  return (
    <Card className="bg-gray-800 border-gray-700">
      <CardHeader>
        <CardTitle className="text-white flex items-center">
          <Shield className="w-5 h-5 mr-2" />
          Privacy Settings
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Profile Visibility Toggle */}
        <div>
          <h3 className="text-white font-medium mb-4">Profile Visibility</h3>
          <div className="flex items-center space-x-6">
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="radio"
                name="profileVisibility"
                value="public"
                checked={profileVisibility === "public"}
                onChange={() => onPrivacyChange('profileVisibility', "public")}
                className="accent-green-500"
              />
              <Eye className="w-4 h-4 text-green-400" />
              <span className="text-white">Public</span>
              <span className="text-xs text-gray-400 ml-1">Anyone can view</span>
            </label>
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="radio"
                name="profileVisibility"
                value="private"
                checked={profileVisibility === "private"}
                onChange={() => onPrivacyChange('profileVisibility', "private")}
                className="accent-yellow-500"
              />
              <Lock className="w-4 h-4 text-yellow-400" />
              <span className="text-white">Private</span>
              <span className="text-xs text-gray-400 ml-1">Only approved followers</span>
            </label>
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
