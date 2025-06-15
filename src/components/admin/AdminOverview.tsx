
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
  // MessageCircle // <-- Removed as messages stat is gone
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
  // totalMessages: number;  // Removed
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
    // totalMessages: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOverviewStats();
  }, []);

  const fetchOverviewStats = async () => {
    try {
      // Fetch total users
      const { count: totalUsers } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });

      // Fetch total subscribers
      const { count: totalSubscribers } = await supabase
        .from('subscribers')
        .select('*', { count: 'exact', head: true })
        .eq('subscribed', true);

      // Fetch service providers
      const { count: totalServiceProviders } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('user_type', 'service_provider');

      // Fetch total posts
      const { count: totalPosts } = await supabase
        .from('posts')
        .select('*', { count: 'exact', head: true });

      // Fetch active users (last 7 days)
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      
      const { count: activeUsers7d } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .gte('last_active', sevenDaysAgo.toISOString());

      // Fetch revenue data
      const { data: revenueData } = await supabase
        .from('post_payments')
        .select('amount')
        .eq('payment_status', 'completed');

      // Fetch matches count
      const { count: matchesCount } = await supabase
        .from('matches')
        .select('*', { count: 'exact', head: true });

      // // Fetch messages count (REMOVED)
      // const { count: messagesCount } = await supabase
      //   .from('messages')
      //   .select('*', { count: 'exact', head: true });

      const totalRevenue = revenueData?.reduce((sum, payment) => sum + payment.amount, 0) || 0;

      setStats({
        totalUsers: totalUsers || 0,
        totalSubscribers: totalSubscribers || 0,
        totalServiceProviders: totalServiceProviders || 0,
        totalPosts: totalPosts || 0,
        activeUsers7d: activeUsers7d || 0,
        totalRevenue,
        totalMatches: matchesCount || 0
        // totalMessages: messagesCount || 0
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
      title: 'Total Users',
      value: stats.totalUsers.toLocaleString(),
      icon: Users,
      color: 'text-blue-400'
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
    // Removed messages card
    // {
    //   title: 'Total Messages',
    //   value: stats.totalMessages.toLocaleString(),
    //   icon: MessageCircle,
    //   color: 'text-cyan-400'
    // }
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index} className="bg-black/20 backdrop-blur-md border-gray-700">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-300">
                  {stat.title}
                </CardTitle>
                <Icon className={`h-4 w-4 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className={`text-2xl font-bold ${stat.color}`}>
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

