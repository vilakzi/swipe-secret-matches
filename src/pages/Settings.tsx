
import React from 'react';
import { Settings as SettingsIcon, User, Bell, Shield, HelpCircle, LogOut } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const Settings = () => {
  const { signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/auth');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const settingsGroups = [
    {
      title: 'Account',
      items: [
        { icon: User, label: 'Edit Profile', action: () => navigate('/profile') },
        { icon: Bell, label: 'Notifications', action: () => {} },
        { icon: Shield, label: 'Privacy & Security', action: () => {} },
      ]
    },
    {
      title: 'Support',
      items: [
        { icon: HelpCircle, label: 'Help & Support', action: () => {} },
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-purple-900 text-white pb-20">
      <div className="max-w-md mx-auto p-4">
        <div className="pt-4 pb-6">
          <h1 className="text-2xl font-bold text-center">Settings</h1>
          <p className="text-gray-400 text-center mt-2">Manage your preferences</p>
        </div>

        <div className="space-y-6">
          {settingsGroups.map((group, groupIndex) => (
            <div key={groupIndex}>
              <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">
                {group.title}
              </h3>
              <Card className="bg-gray-800/50 border-gray-700">
                <CardContent className="p-0">
                  {group.items.map((item, itemIndex) => {
                    const Icon = item.icon;
                    return (
                      <button
                        key={itemIndex}
                        onClick={item.action}
                        className="w-full flex items-center p-4 hover:bg-gray-700/50 transition-colors first:rounded-t-lg last:rounded-b-lg border-b border-gray-700 last:border-b-0"
                      >
                        <Icon className="w-5 h-5 text-purple-400 mr-3" />
                        <span className="text-white font-medium">{item.label}</span>
                      </button>
                    );
                  })}
                </CardContent>
              </Card>
            </div>
          ))}

          <Card className="bg-gray-800/50 border-gray-700">
            <CardContent className="p-4">
              <Button
                onClick={handleSignOut}
                variant="destructive"
                className="w-full bg-red-600 hover:bg-red-700"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Sign Out
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Settings;
