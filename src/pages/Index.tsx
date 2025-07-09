
import React, { useState } from 'react';
import { useIsMobile } from '@/hooks/use-mobile';
import { useEnhancedAuth } from '@/contexts/EnhancedAuthContext';
import ErrorBoundary from '@/components/common/ErrorBoundary';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import WorkingFeed from '@/components/feed/WorkingFeed';
import { Button } from '@/components/ui/button';
import { LogOut, Settings, Users } from 'lucide-react';

const Index = () => {
  const isMobile = useIsMobile();
  const { user, loading, signOut } = useEnhancedAuth();
  const [viewMode, setViewMode] = useState<'feed' | 'browse'>('feed');

  console.log('Index component rendering - user:', user?.id, 'loading:', loading);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-purple-900 flex items-center justify-center">
        <LoadingSpinner size="lg" text="Loading your app..." />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-purple-900 flex items-center justify-center">
        <div className="text-center p-8">
          <h1 className="text-3xl font-bold text-white mb-4">Welcome to ConnectsBuddy</h1>
          <p className="text-gray-300 mb-6">Please sign in to continue</p>
          <a 
            href="/auth" 
            className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg transition-colors"
          >
            Sign In
          </a>
        </div>
      </div>
    );
  }

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-purple-900">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-gray-800/80 backdrop-blur-sm border-b border-gray-700">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <h1 className="text-xl font-bold text-white">ConnectsBuddy</h1>
                <div className="flex items-center space-x-2">
                  <Button
                    size="sm"
                    onClick={() => setViewMode('feed')}
                    variant={viewMode === 'feed' ? 'default' : 'ghost'}
                  >
                    <Users className="w-4 h-4 mr-1" />
                    Feed
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => setViewMode('browse')}
                    variant={viewMode === 'browse' ? 'default' : 'ghost'}
                  >
                    Browse
                  </Button>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-400">
                  {user.email}
                </span>
                <Button size="sm" variant="ghost" onClick={handleSignOut}>
                  <LogOut className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="container mx-auto px-4 py-8">
          {viewMode === 'feed' ? (
            <WorkingFeed />
          ) : (
            <div className="text-center">
              <h2 className="text-2xl font-bold text-white mb-4">Browse Mode</h2>
              <p className="text-gray-300">Browse functionality coming soon...</p>
            </div>
          )}
        </div>
      </div>
    </ErrorBoundary>
  );
};

export default Index;
