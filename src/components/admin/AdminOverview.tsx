import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, TrendingUp, Activity, Calendar } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface OverviewStats {
  totalUsers: number;
  totalServiceProviders: number;
  totalPosts: number;
  activeUsers7d: number;
}

const AdminOverview = () => {
  const [stats, setStats] = React.useState<OverviewStats>({
    totalUsers: 0,
    totalServiceProviders: 0,
    totalPosts: 0,
    activeUsers7d: 0,
  });
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    fetchOverviewStats();
  }, []);

  const fetchOverviewStats = async () => {
    setLoading(true);
    try {
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      const [usersRes, providersRes, postsRes, activityRes] = await Promise.all([
        supabase.from('profiles').select('*', { count: 'exact', head: true }),
        supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('user_type', 'service_provider'),
        supabase.from('posts').select('*', { count: 'exact', head: true }),
        supabase.from('user_activity').select('*', { count: 'exact', head: true }).gte('last_seen_at', sevenDaysAgo.toISOString()),
      ]);

      setStats({
        totalUsers: usersRes.count || 0,
        totalServiceProviders: providersRes.count || 0,
        totalPosts: postsRes.count || 0,
        activeUsers7d: activityRes.count || 0,
      });
    } catch (error) {
      toast({
        title: 'Error loading statistics',
        description: 'Failed to load dashboard overview',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {Array.from({ length: 4 }).map((_, index) => (
          <Card key={index} className="bg-black/20 backdrop-blur-md border-gray-700">
            <CardContent className="p-6">
              <div className="h-16 bg-gray-700 animate-pulse rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const statCards = [
    {
      title: 'Total Platform Users',
      value: stats.totalUsers.toLocaleString(),
      icon: Users,
    },
    {
      title: 'Service Providers',
      value: stats.totalServiceProviders.toLocaleString(),
      icon: Activity,
    },
    {
      title: 'Active Users (7d)',
      value: stats.activeUsers7d.toLocaleString(),
      icon: TrendingUp,
    },
    {
      title: 'Total Posts',
      value: stats.totalPosts.toLocaleString(),
      icon: Calendar,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => {
          const Icon = stat.icon as any;
          return (
            <Card key={index} className="bg-black/20 backdrop-blur-md border-gray-700">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-300">
                  {stat.title}
                </CardTitle>
                <Icon className="h-4 w-4 text-blue-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-400">
                  {stat.value}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default AdminOverview;
