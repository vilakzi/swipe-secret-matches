
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Users, 
  DollarSign, 
  TrendingUp, 
  UserCheck,
  Activity,
  Calendar,
  Heart
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface OverviewStats {
  totalUsers: number;
  totalSubscribers: number;
  totalServiceProviders: number;
  totalPosts: number;
  activeUsers7d: number;
  totalRevenue: number;
  totalMatches: number;
}

const AdminOverview = () => {
  const [stats, setStats] = useState<OverviewStats>({
    totalUsers: 0,
    totalSubscribers: 0,
    totalServiceProviders: 0,
    totalPosts: 0,
    activeUsers7d: 0,
    totalRevenue: 0,
    totalMatches: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOverviewStats();
  }, []);

  const fetchOverviewStats = async () => {
    setLoading(true);
    try {
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      // Run all queries in parallel with error handling
      const [
        usersRes,
        subscribersRes,
        providersRes,
        postsRes,
        activeUsersRes,
        revenueRes,
        matchesRes
      ] = await Promise.allSettled([
        supabase.from('profiles').select('*', { count: 'exact', head: true }),
        supabase.from('subscribers').select('*', { count: 'exact', head: true }).eq('subscribed', true),
        supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('user_type', 'service_provider'),
        supabase.from('posts').select('*', { count: 'exact', head: true }),
        supabase.from('profiles').select('*', { count: 'exact', head: true }).gte('last_active', sevenDaysAgo.toISOString()),
        supabase.from('post_payments').select('amount').eq('payment_status', 'completed'),
        supabase.from('matches').select('*', { count: 'exact', head: true })
      ]);

      // Extract results with error handling
      const getUserCount = () => {
        if (usersRes.status === 'fulfilled' && !usersRes.value.error) {
          return usersRes.value.count || 0;
        }
        console.error('Users query failed:', usersRes.status === 'rejected' ? usersRes.reason : usersRes.value.error);
        return 0;
      };

      const getSubscriberCount = () => {
        if (subscribersRes.status === 'fulfilled' && !subscribersRes.value.error) {
          return subscribersRes.value.count || 0;
        }
        console.error('Subscribers query failed:', subscribersRes.status === 'rejected' ? subscribersRes.reason : subscribersRes.value.error);
        return 0;
      };

      const getProviderCount = () => {
        if (providersRes.status === 'fulfilled' && !providersRes.value.error) {
          return providersRes.value.count || 0;
        }
        console.error('Providers query failed:', providersRes.status === 'rejected' ? providersRes.reason : providersRes.value.error);
        return 0;
      };

      const getPostCount = () => {
        if (postsRes.status === 'fulfilled' && !postsRes.value.error) {
          return postsRes.value.count || 0;
        }
        console.error('Posts query failed:', postsRes.status === 'rejected' ? postsRes.reason : postsRes.value.error);
        return 0;
      };

      const getActiveUserCount = () => {
        if (activeUsersRes.status === 'fulfilled' && !activeUsersRes.value.error) {
          return activeUsersRes.value.count || 0;
        }
        console.error('Active users query failed:', activeUsersRes.status === 'rejected' ? activeUsersRes.reason : activeUsersRes.value.error);
        return 0;
      };

      const getTotalRevenue = () => {
        if (revenueRes.status === 'fulfilled' && !revenueRes.value.error) {
          return (revenueRes.value.data || []).reduce(
            (sum: number, payment: { amount: number }) => sum + (Number(payment.amount) || 0),
            0
          );
        }
        console.error('Revenue query failed:', revenueRes.status === 'rejected' ? revenueRes.reason : revenueRes.value.error);
        return 0;
      };

      const getMatchCount = () => {
        if (matchesRes.status === 'fulfilled' && !matchesRes.value.error) {
          return matchesRes.value.count || 0;
        }
        console.error('Matches query failed:', matchesRes.status === 'rejected' ? matchesRes.reason : matchesRes.value.error);
        return 0;
      };

      setStats({
        totalUsers: getUserCount(),
        totalSubscribers: getSubscriberCount(),
        totalServiceProviders: getProviderCount(),
        totalPosts: getPostCount(),
        activeUsers7d: getActiveUserCount(),
        totalRevenue: getTotalRevenue(),
        totalMatches: getMatchCount()
      });
    } catch (error) {
      console.error('Error fetching overview stats:', error);
      toast({
        title: "Error loading statistics",
        description: "Failed to load dashboard overview",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {Array.from({ length: 7 }).map((_, index) => (
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
      color: 'text-blue-400',
      highlight: true // Make this card stand out
    },
    {
      title: 'Subscribers',
      value: stats.totalSubscribers.toLocaleString(),
      icon: UserCheck,
      color: 'text-green-400'
    },
    {
      title: 'Service Providers',
      value: stats.totalServiceProviders.toLocaleString(),
      icon: Activity,
      color: 'text-purple-400'
    },
    {
      title: 'Active Users (7d)',
      value: stats.activeUsers7d.toLocaleString(),
      icon: TrendingUp,
      color: 'text-orange-400'
    },
    {
      title: 'Total Posts',
      value: stats.totalPosts.toLocaleString(),
      icon: Calendar,
      color: 'text-indigo-400'
    },
    {
      title: 'Total Revenue',
      value: `R${(stats.totalRevenue / 100).toLocaleString()}`,
      icon: DollarSign,
      color: 'text-green-400'
    },
    {
      title: 'Total Matches',
      value: stats.totalMatches.toLocaleString(),
      icon: Heart,
      color: 'text-pink-400'
    }
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card 
              key={index} 
              className={`bg-black/20 backdrop-blur-md border-gray-700 ${
                stat.highlight ? 'ring-2 ring-blue-400/50 bg-blue-900/10' : ''
              }`}
            >
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className={`text-sm font-medium ${
                  stat.highlight ? 'text-blue-300' : 'text-gray-300'
                }`}>
                  {stat.title}
                </CardTitle>
                <Icon className={`h-4 w-4 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className={`text-2xl font-bold ${stat.color} ${
                  stat.highlight ? 'text-3xl' : ''
                }`}>
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
