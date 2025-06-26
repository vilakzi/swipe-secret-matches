
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Shield, UserPlus, Crown } from 'lucide-react';
import { useContentPromotion } from '@/hooks/useContentPromotion';

const SuperAdminPanel = () => {
  const [emailToPromote, setEmailToPromote] = useState('content@connectsbuddy.online');
  const { promoteUserEmail, isLoading } = useContentPromotion();

  const handlePromoteUser = async () => {
    if (!emailToPromote.trim()) return;
    
    const success = await promoteUserEmail(emailToPromote.trim());
    if (success) {
      setEmailToPromote('');
    }
  };

  const handlePromoteContentUser = async () => {
    await promoteUserEmail('content@connectsbuddy.online');
  };

  return (
    <Card className="bg-gradient-to-r from-purple-900 to-indigo-900 border-purple-600">
      <CardHeader>
        <CardTitle className="text-white flex items-center">
          <Crown className="w-5 h-5 mr-2 text-yellow-400" />
          Super Admin Controls
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="p-4 bg-purple-800/30 rounded-lg border border-purple-600">
          <h3 className="text-white font-medium mb-3 flex items-center">
            <Shield className="w-4 h-4 mr-2" />
            Quick Actions
          </h3>
          <Button
            onClick={handlePromoteContentUser}
            disabled={isLoading}
            className="w-full bg-yellow-600 hover:bg-yellow-700 text-white"
          >
            <UserPlus className="w-4 h-4 mr-2" />
            Promote content@connectsbuddy.online to Admin
          </Button>
        </div>

        <div className="p-4 bg-purple-800/30 rounded-lg border border-purple-600">
          <h3 className="text-white font-medium mb-3">Promote User to Admin</h3>
          <div className="space-y-3">
            <div>
              <Label htmlFor="email" className="text-gray-200">Email Address</Label>
              <Input
                id="email"
                type="email"
                value={emailToPromote}
                onChange={(e) => setEmailToPromote(e.target.value)}
                placeholder="Enter user email"
                className="bg-purple-900/50 border-purple-600 text-white placeholder-gray-400"
              />
            </div>
            <Button
              onClick={handlePromoteUser}
              disabled={isLoading || !emailToPromote.trim()}
              className="w-full bg-indigo-600 hover:bg-indigo-700"
            >
              {isLoading ? "Promoting..." : "Promote to Admin"}
            </Button>
          </div>
        </div>

        <div className="p-3 bg-yellow-900/20 border border-yellow-600 rounded-lg">
          <p className="text-yellow-200 text-sm">
            <strong>Warning:</strong> Admin privileges include content promotion, user management, and system access. Use responsibly.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default SuperAdminPanel;
