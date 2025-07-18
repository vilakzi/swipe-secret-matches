
import React from 'react';
import { useEnhancedAuth } from '@/contexts/EnhancedAuthContext';
import { Navigate } from 'react-router-dom';

export default function Index() {
  const { user, loading, signOut } = useEnhancedAuth();

  console.log('Index page - user:', user?.email || 'none', 'loading:', loading);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-purple-900 p-4">
      <div className="max-w-4xl mx-auto">
        <header className="bg-gray-800 rounded-lg p-6 mb-6 border border-gray-700">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-white">ConnectsBuddy</h1>
              <p className="text-gray-400">Welcome back, {user.email}</p>
            </div>
            <button
              onClick={signOut}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              Sign Out
            </button>
          </div>
        </header>

        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <h2 className="text-xl font-semibold text-white mb-4">Dashboard</h2>
          <p className="text-gray-400">Your app is now running with a clean authentication system!</p>
          <p className="text-gray-400 mt-2">All your existing database data has been preserved.</p>
        </div>
      </div>
    </div>
  );
}
