
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Upload, 
  Settings, 
  BarChart3, 
  FileText, 
  Shield,
  Crown
} from 'lucide-react';
import ContentUpload from './ContentUpload';
import ContentManager from './ContentManager';
import AnalyticsDashboard from './AnalyticsDashboard';

const SuperAdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('upload');

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-gradient-to-r from-purple-600 to-blue-600 text-white">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl font-bold flex items-center gap-2">
                <Crown className="w-8 h-8" />
                SuperAdmin Dashboard
              </CardTitle>
              <p className="text-purple-100 mt-2">
                Complete control over content management and analytics
              </p>
            </div>
            <Badge className="bg-yellow-500 text-black">
              <Shield className="w-4 h-4 mr-1" />
              Super Admin
            </Badge>
          </div>
        </CardHeader>
      </Card>

      {/* Main Dashboard */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 bg-white shadow-md">
          <TabsTrigger value="upload" className="data-[state=active]:bg-purple-600 data-[state=active]:text-white">
            <Upload className="w-4 h-4 mr-2" />
            Upload
          </TabsTrigger>
          <TabsTrigger value="content" className="data-[state=active]:bg-purple-600 data-[state=active]:text-white">
            <FileText className="w-4 h-4 mr-2" />
            Content
          </TabsTrigger>
          <TabsTrigger value="analytics" className="data-[state=active]:bg-purple-600 data-[state=active]:text-white">
            <BarChart3 className="w-4 h-4 mr-2" />
            Analytics
          </TabsTrigger>
          <TabsTrigger value="settings" className="data-[state=active]:bg-purple-600 data-[state=active]:text-white">
            <Settings className="w-4 h-4 mr-2" />
            Settings
          </TabsTrigger>
        </TabsList>

        <TabsContent value="upload" className="space-y-6">
          <ContentUpload />
        </TabsContent>

        <TabsContent value="content" className="space-y-6">
          <ContentManager />
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <AnalyticsDashboard />
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>SuperAdmin Settings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 border rounded-lg">
                  <h3 className="font-medium mb-2">Content Settings</h3>
                  <p className="text-sm text-gray-600">
                    Manage default content settings, approval workflows, and publishing rules.
                  </p>
                </div>
                
                <div className="p-4 border rounded-lg">
                  <h3 className="font-medium mb-2">User Management</h3>
                  <p className="text-sm text-gray-600">
                    Control user permissions, content moderation, and access levels.
                  </p>
                </div>
                
                <div className="p-4 border rounded-lg">
                  <h3 className="font-medium mb-2">System Configuration</h3>
                  <p className="text-sm text-gray-600">
                    Configure system-wide settings, storage limits, and performance options.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SuperAdminDashboard;
