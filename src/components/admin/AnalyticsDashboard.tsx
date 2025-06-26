import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, UserPlus } from 'lucide-react';
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
  const total_users = analytics.total_users ?? 0;
  const new_users = analytics.new_users ?? 0;

  const stats = [
    {
      title: 'Total Users',
      value: total_users,
      icon: Users,
      color: 'text-teal-600',
      bgColor: 'bg-teal-100',
    },
    {
      title: 'New Joiners',
      value: new_users,
      icon: UserPlus,
      color: 'text-cyan-600',
      bgColor: 'bg-cyan-100',
    },
    // ... other existing stats ...
  ];

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
      {/* ... existing engagement metrics ... */}

      {/* Performance Insights */}
      {/* ... existing performance insights ... */}

      {/* User Control Section */}
      <Card>
        <CardHeader>
          <CardTitle>Manage Users</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center">
            <p className="mb-4 text-gray-700">
              Manage all registered users and their permissions.
            </p>
            <button
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              onClick={() => {
                window.location.href = '/admin/users';
              }}
            >
              Go to User Management
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AnalyticsDashboard;