import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from '@/hooks/use-toast';
import ProviderProfileHeader from '@/components/provider-profile/ProviderProfileHeader';
import ProviderProfileTabs from '@/components/provider-profile/ProviderProfileTabs';
import { useProviderProfile } from '@/hooks/useProviderProfile';
import { ProviderData, ProviderPost } from '@/types/provider';

// Error fallback UI
const ProviderErrorFallback = ({ error, onBack }: { error: Error, onBack: () => void }) => (
  <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-purple-900 flex items-center justify-center">
    <div className="text-center text-white">
      <h2 className="text-2xl font-bold mb-2">Provider not found</h2>
      <p className="mb-4">{error.message}</p>
      <button
        onClick={onBack}
        className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded"
        aria-label="Go back to feed"
      >
        Back to Feed
      </button>
    </div>
  </div>
);

const ProviderProfile = () => {
  const { providerId } = useParams<{ providerId: string }>();
  const navigate = useNavigate();
  const { provider, posts, loading, error } = useProviderProfile(providerId);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-purple-900 flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  if (error || !provider) {
    return <ProviderErrorFallback error={error || new Error('Provider not found')} onBack={() => navigate('/')} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-purple-900">
      <ProviderProfileHeader provider={provider} onBack={() => navigate('/')} />
      <div className="max-w-4xl mx-auto p-4 pt-8">
        <ProviderProfileTabs provider={provider} posts={posts} />
      </div>
    </div>
  );
};

export default ProviderProfile;

// NOTE: This file is still quite long! Consider further splitting or refactoring if more logic/UI is added in the future.
