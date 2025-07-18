
import React, { useState } from 'react';
import EnhancedAuthForm from '@/components/auth/EnhancedAuthForm';

const Auth = () => {
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');

  const handleToggleMode = () => {
    setMode(mode === 'signin' ? 'signup' : 'signin');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-purple-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <EnhancedAuthForm mode={mode} onToggleMode={handleToggleMode} />
      </div>
    </div>
  );
};

export default Auth;
