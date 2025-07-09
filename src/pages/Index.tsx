
import React, { useState, useCallback } from 'react';
import { useIsMobile } from '@/hooks/use-mobile';
import { useEnhancedAuth } from '@/contexts/EnhancedAuthContext';
import ErrorBoundary from '@/components/common/ErrorBoundary';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import SimpleFeed from '@/components/feed/SimpleFeed';

const Index = () => {
  const isMobile = useIsMobile();
  const { user, loading } = useEnhancedAuth();
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

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-purple-900">
        {/* View Mode Toggle */}
        <div className="sticky top-0 z-10 bg-gray-800/80 backdrop-blur-sm border-b border-gray-700 p-4">
          <div className="flex items-center justify-center space-x-4">
            <button
              onClick={() => setViewMode('feed')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                viewMode === 'feed'
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              Feed
            </button>
            <button
              onClick={() => setViewMode('browse')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                viewMode === 'browse'
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              Browse
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="container mx-auto px-4 py-8">
          {viewMode === 'feed' ? (
            <SimpleFeed />
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
