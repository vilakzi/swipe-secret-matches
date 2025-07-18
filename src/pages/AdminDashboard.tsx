
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useUserRole } from '@/hooks/useUserRole';
import AdminDashboard from '@/components/admin/AdminDashboard';
import LoadingSpinner from '@/components/common/LoadingSpinner';

const AdminDashboardPage = () => {
  const { user, loading: authLoading } = useAuth();
  const { role, loading: roleLoading } = useUserRole();

  if (authLoading || roleLoading) {
    return <LoadingSpinner />;
  }

  if (!user || !['admin', 'superadmin'].includes(role || '')) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-purple-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Access Denied</h1>
          <p className="text-gray-300">You don't have permission to access this page.</p>
        </div>
      </div>
    );
  }

  return <AdminDashboard />;
};

export default AdminDashboardPage;
