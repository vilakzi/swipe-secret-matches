
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import ProfileSetupWizard from '@/components/onboarding/ProfileSetupWizard';

const Onboarding = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-purple-900 flex items-center justify-center">
        <div className="text-center p-8">
          <h2 className="text-2xl font-bold text-white mb-4">Please log in to set up your profile</h2>
          <Button
            onClick={() => navigate('/auth')}
            className="bg-purple-600 hover:bg-purple-700"
          >
            Go to Login
          </Button>
        </div>
      </div>
    );
  }

  return <ProfileSetupWizard />;
};

export default Onboarding;
