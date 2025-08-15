import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Upload, 
  Shield, 
  Settings, 
  BarChart3,
  FileImage,
  CheckCircle,
  Clock,
  XCircle,
  Crown
} from 'lucide-react';
import ContentUpload from './ContentUpload';
import ContentModerationPanel from './ContentModerationPanel';
import ContentManager from './ContentManager';
import SuperAdminPanel from './SuperAdminPanel';
import { useAdminContent } from '@/hooks/useAdminContent';

const SuperAdminDashboard = () => {
  const { content } = useAdminContent();
  
  // Calculate stats
  const stats = {
    total: content.length,
    pending: content.filter(item => item.approval_status === 'pending').length,
    approved: content.filter(item => item.approval_status === 'approved').length,
    rejected: content.filter(item => item.approval_status === 'rejected').length,
    scheduled: content.filter(item => item.status === 'scheduled').length,
    promoted: content.filter(item => item.is_promoted).length,
  };

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Content</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
              <FileImage className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pending Review</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
              </div>
              <Clock className="w-8 h-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Approved</p>
                <p className="text-2xl font-bold text-green-600">{stats.approved}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Rejected</p>
                <p className="text-2xl font-bold text-red-600">{stats.rejected}</p>
              </div>
              <XCircle className="w-8 h-8 text-red-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Scheduled</p>
                <p className="text-2xl font-bold text-purple-600">{stats.scheduled}</p>
              </div>
              <Clock className="w-8 h-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Promoted</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.promoted}</p>
              </div>
              <Crown className="w-8 h-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Content Management Tabs */}
      <Tabs defaultValue="super-admin" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5 bg-black/20 backdrop-blur-md">
          <TabsTrigger value="super-admin" className="text-white data-[state=active]:bg-purple-600">
            <Crown className="w-4 h-4 mr-2" />
            Super Admin
          </TabsTrigger>
          <TabsTrigger value="upload" className="text-white data-[state=active]:bg-purple-600">
            <Upload className="w-4 h-4 mr-2" />
            Upload Content
          </TabsTrigger>
          <TabsTrigger value="moderation" className="text-white data-[state=active]:bg-purple-600">
            <Shield className="w-4 h-4 mr-2" />
            Moderation ({stats.pending})
          </TabsTrigger>
          <TabsTrigger value="management" className="text-white data-[state=active]:bg-purple-600">
            <Settings className="w-4 h-4 mr-2" />
            Content Manager
          </TabsTrigger>
          <TabsTrigger value="analytics" className="text-white data-[state=active]:bg-purple-600">
            <BarChart3 className="w-4 h-4 mr-2" />
            Analytics
          </TabsTrigger>
        </TabsList>

        <TabsContent value="super-admin" className="space-y-6">
          <SuperAdminPanel />
        </TabsContent>

        <TabsContent value="upload" className="space-y-6">
          <ContentUpload />
        </TabsContent>

        <TabsContent value="moderation" className="space-y-6">
          <ContentModerationPanel />
        </TabsContent>

        <TabsContent value="management" className="space-y-6">
          <ContentManager />
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Content Analytics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg text-white">
                  <h3 className="text-lg font-semibold">Total Views</h3>
                  <p className="text-3xl font-bold">
                    {content.reduce((sum, item) => sum + (item.view_count || 0), 0).toLocaleString()}
                  </p>
                </div>
                
                <div className="p-4 bg-gradient-to-r from-green-500 to-teal-600 rounded-lg text-white">
                  <h3 className="text-lg font-semibold">Total Likes</h3>
                  <p className="text-3xl font-bold">
                    {content.reduce((sum, item) => sum + (item.like_count || 0), 0).toLocaleString()}
                  </p>
                </div>
                
                <div className="p-4 bg-gradient-to-r from-orange-500 to-red-600 rounded-lg text-white">
                  <h3 className="text-lg font-semibold">Total Shares</h3>
                  <p className="text-3xl font-bold">
                    {content.reduce((sum, item) => sum + (item.share_count || 0), 0).toLocaleString()}
                  </p>
                </div>
              </div>

              {/* Category Breakdown */}
              <div className="mt-6">
                <h4 className="text-lg font-semibold mb-4">Content by Category</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {Object.entries(
                    content.reduce((acc, item) => {
                      acc[item.category] = (acc[item.category] || 0) + 1;
                      return acc;
                    }, {} as Record<string, number>)
                  ).map(([category, count]) => (
                    <div key={category} className="p-2 bg-gray-100 rounded text-center">
                      <div className="text-sm font-medium capitalize">{String(category)}</div>
                      <div className="text-lg font-bold">{String(count)}</div>
                    </div>
                  ))}
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
