import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  TrendingUp, 
  Eye, 
  Heart, 
  Share2, 
  FileText, 
  CheckCircle,
  Clock,
  Users
} from 'lucide-react';
import { useAnalytics } from '@/hooks/useAnalytics';

const AnalyticsDashboard = () => {
  const { analytics, loading } = useAnalytics();

  if (loading) {
    return <div className="text-center py-8">Loading analytics...</div>;
  }

  if (!analytics) {
    return <div className="text-center py-8">No analytics data available</div>;
  }

  // Fallbacks for missing analytics fields
  const total_content = analytics.total_content ?? 0;
  const published_content = analytics.published_content ?? 0;
  const draft_content = analytics.draft_content ?? 0;
  const total_views = analytics.total_views ?? 0;
  const total_likes = analytics.total_likes ?? 0;
  const total_shares = analytics.total_shares ?? 0;

  const stats = [
    {
      title: 'Total Content',
      value: total_content,
      icon: FileText,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
    },
    {
      title: 'Published Content',
      value: published_content,
      icon: CheckCircle,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
    },
    {
      title: 'Draft Content',
      value: draft_content,
      icon: Clock,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-100',
    },
    {
      title: 'Total Views',
      value: total_views,
      icon: Eye,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
    },
    {
      title: 'Total Likes',
      value: total_likes,
      icon: Heart,
      color: 'text-red-600',
      bgColor: 'bg-red-100',
    },
    {
      title: 'Total Shares',
      value: total_shares,
      icon: Share2,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-100',
    },
  ];

  const engagementRate = total_content > 0 && total_views > 0
    ? (((total_likes + total_shares) / total_views) * 100).toFixed(2)
    : '0.00';

  const avgViewsPerContent = total_content > 0
    ? Math.round(total_views / total_content)
    : 0;

  return (
    <div className="space-y-6">
      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      {stat.title}
                    </p>
                    <p className="text-3xl font-bold text-gray-900">
                      {stat.value.toLocaleString()}
                    </p>
                  </div>
                  <div className={`p-3 rounded-full ${stat.bgColor}`}>
                    <Icon className={`w-6 h-6 ${stat.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Engagement Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Engagement Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              <p className="text-4xl font-bold text-purple-600 mb-2">
                {engagementRate}%
              </p>
              <p className="text-sm text-gray-600">
                Average engagement across all content
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Average Views
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              <p className="text-4xl font-bold text-blue-600 mb-2">
                {avgViewsPerContent.toLocaleString()}
              </p>
              <p className="text-sm text-gray-600">
                Average views per content piece
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance Insights */}
      <Card>
        <CardHeader>
          <CardTitle>Performance Insights</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-green-600 mb-2">
                {total_content > 0 
                  ? Math.round((published_content / total_content) * 100)
                  : 0}%
              </div>
              <p className="text-sm text-gray-600">Content Published</p>
            </div>
            
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-blue-600 mb-2">
                {total_views > 0
                  ? Math.round((total_likes / total_views) * 100)
                  : 0}%
              </div>
              <p className="text-sm text-gray-600">Like Rate</p>
            </div>
            
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-purple-600 mb-2">
                {total_views > 0
                  ? Math.round((total_shares / total_views) * 100)
                  : 0}%
              </div>
              <p className="text-sm text-gray-600">Share Rate</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AnalyticsDashboard;
