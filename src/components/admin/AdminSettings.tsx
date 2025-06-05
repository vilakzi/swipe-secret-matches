
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { 
  Settings, 
  Database, 
  Bell, 
  Shield, 
  Trash2,
  RefreshCw,
  Download
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

const AdminSettings = () => {
  const [loading, setLoading] = useState(false);
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [registrationEnabled, setRegistrationEnabled] = useState(true);

  const handleUpdateMetrics = async () => {
    setLoading(true);
    try {
      await supabase.rpc('update_daily_metrics');
      toast({
        title: "Metrics updated",
        description: "Daily metrics have been refreshed successfully",
      });
    } catch (error) {
      console.error('Error updating metrics:', error);
      toast({
        title: "Error",
        description: "Failed to update metrics",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCleanupExpiredMatches = async () => {
    setLoading(true);
    try {
      await supabase.rpc('cleanup_expired_matches');
      toast({
        title: "Cleanup completed",
        description: "Expired matches have been removed",
      });
    } catch (error) {
      console.error('Error cleaning up matches:', error);
      toast({
        title: "Error",
        description: "Failed to cleanup expired matches",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleExportData = async () => {
    setLoading(true);
    try {
      // Export user data
      const { data: users } = await supabase
        .from('admin_user_overview')
        .select('*');

      if (users) {
        const dataStr = JSON.stringify(users, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `user_data_${new Date().toISOString().split('T')[0]}.json`;
        link.click();
        URL.revokeObjectURL(url);

        toast({
          title: "Export completed",
          description: "User data has been exported successfully",
        });
      }
    } catch (error) {
      console.error('Error exporting data:', error);
      toast({
        title: "Error",
        description: "Failed to export data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* System Controls */}
      <Card className="bg-black/20 backdrop-blur-md border-gray-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center">
            <Settings className="w-5 h-5 mr-2" />
            System Controls
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-white">Maintenance Mode</Label>
                  <p className="text-sm text-gray-400">
                    Enable to prevent new user access
                  </p>
                </div>
                <Switch
                  checked={maintenanceMode}
                  onCheckedChange={setMaintenanceMode}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-white">Registration Enabled</Label>
                  <p className="text-sm text-gray-400">
                    Allow new user registrations
                  </p>
                </div>
                <Switch
                  checked={registrationEnabled}
                  onCheckedChange={setRegistrationEnabled}
                />
              </div>
            </div>

            <div className="space-y-4">
              <Button
                onClick={handleUpdateMetrics}
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Update Metrics
              </Button>

              <Button
                onClick={handleCleanupExpiredMatches}
                disabled={loading}
                variant="outline"
                className="w-full border-gray-600 text-white hover:bg-gray-800"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Cleanup Expired Matches
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Data Management */}
      <Card className="bg-black/20 backdrop-blur-md border-gray-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center">
            <Database className="w-5 h-5 mr-2" />
            Data Management
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button
              onClick={handleExportData}
              disabled={loading}
              className="bg-green-600 hover:bg-green-700"
            >
              <Download className="w-4 h-4 mr-2" />
              Export User Data
            </Button>

            <Button
              disabled={loading}
              variant="outline"
              className="border-gray-600 text-white hover:bg-gray-800"
            >
              <Shield className="w-4 h-4 mr-2" />
              Backup Database
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Notification Settings */}
      <Card className="bg-black/20 backdrop-blur-md border-gray-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center">
            <Bell className="w-5 h-5 mr-2" />
            Admin Notifications
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-white">Email Alerts</Label>
                <p className="text-sm text-gray-400">
                  Receive email notifications for important events
                </p>
              </div>
              <Switch defaultChecked />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label className="text-white">Payment Alerts</Label>
                <p className="text-sm text-gray-400">
                  Get notified of payment failures and completions
                </p>
              </div>
              <Switch defaultChecked />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label className="text-white">User Reports</Label>
                <p className="text-sm text-gray-400">
                  Notify when users report content or other users
                </p>
              </div>
              <Switch defaultChecked />
            </div>
          </div>

          <Separator className="bg-gray-700" />

          <div className="space-y-2">
            <Label className="text-white">Admin Email</Label>
            <Input
              type="email"
              placeholder="admin@example.com"
              defaultValue="labsfrica@gmail.com"
              className="bg-gray-800 border-gray-600 text-white"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminSettings;
