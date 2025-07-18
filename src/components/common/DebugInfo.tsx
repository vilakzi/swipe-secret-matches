import React from 'react';
import { useEnhancedAuth } from '@/contexts/EnhancedAuthContext';

const DebugInfo: React.FC = () => {
  const { user, session, loading, authError } = useEnhancedAuth();
  
  const debugInfo = {
    loading,
    hasUser: !!user,
    hasSession: !!session,
    authError,
    userEmail: user?.email,
    timestamp: new Date().toISOString()
  };

  return (
    <div className="fixed bottom-4 right-4 bg-gray-800 border border-gray-600 rounded-lg p-3 text-xs text-gray-300 max-w-xs">
      <h3 className="font-semibold mb-2 text-yellow-400">Debug Info</h3>
      <pre className="whitespace-pre-wrap overflow-auto max-h-40">
        {JSON.stringify(debugInfo, null, 2)}
      </pre>
    </div>
  );
};

export default DebugInfo;