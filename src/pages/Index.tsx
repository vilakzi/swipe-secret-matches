
import React, { useState } from 'react';
import { useIsMobile } from '@/hooks/use-mobile';
import { useEnhancedAuth } from '@/contexts/EnhancedAuthContext';
import ErrorBoundary from '@/components/common/ErrorBoundary';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import WorkingFeed from '@/components/feed/WorkingFeed';
import ProfileBrowser from '@/components/browse/ProfileBrowser';
import ProfileCompletionChecker from '@/components/profile/ProfileCompletionChecker';
import AppHeader from '@/components/common/AppHeader';

const Index = () => {
  const isMobile = useIsMobile();
  const { user, loading } = useEnhancedAuth();
  const [viewMode, setViewMode] = useState<'feed' | 'browse'>('feed');

  console.log('Index component rendering - user:', user?.id, 'loading:', loading);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-purple-900 flex items-center justify-center">
        <LoadingSpinner size="lg" text="Loading ConnectsBuddy..." />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-purple-900 flex items-center justify-center">
        <div className="text-center p-8 max-w-md mx-auto">
          <div className="mb-8">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent mb-4">
              Welcome to ConnectsBuddy
            </h1>
            <p className="text-gray-300 text-lg mb-2">Connect. Discover. Engage.</p>
            <p className="text-gray-400 text-sm">Please sign in to start connecting with others</p>
          </div>
          
          <div className="space-y-4">
            <a 
              href="/auth" 
              className="block w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold px-8 py-4 rounded-lg transition-all duration-200 transform hover:scale-105"
            >
              Get Started
            </a>
            <p className="text-gray-500 text-xs">
              Join thousands of users connecting on ConnectsBuddy
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-purple-900">
        {/* Header */}
        <AppHeader viewMode={viewMode} onViewModeChange={setViewMode} />

        {/* Content Area */}
        <div className="container mx-auto px-4 py-8">
          <ProfileCompletionChecker />
          {viewMode === 'feed' ? (
            <WorkingFeed />
          ) : (
            <ProfileBrowser />
          )}
        </div>
      </div>
    </ErrorBoundary>
  );
};

export default Index;
