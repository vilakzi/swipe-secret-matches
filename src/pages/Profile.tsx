
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Settings } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import UserProfileSection from '@/components/profile/UserProfileSection';
import ErrorBoundary from '@/components/common/ErrorBoundary';

const Profile = () => {
  const navigate = useNavigate();
  const { signOut } = useAuth();

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/auth');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-background">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-md border-b border-border">
          <div className="flex items-center justify-between p-4 max-w-lg mx-auto">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/')}
              className="text-foreground hover:bg-muted"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <h1 className="text-lg font-semibold text-foreground">Profile</h1>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/settings')}
              className="text-foreground hover:bg-muted"
            >
              <Settings className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-lg mx-auto p-4 pb-20">
          <UserProfileSection />
          
          {/* Sign Out Button */}
          <div className="mt-8 pt-6 border-t border-border">
            <Button
              variant="outline"
              onClick={handleSignOut}
              className="w-full text-destructive border-destructive hover:bg-destructive/10"
            >
              Sign Out
            </Button>
          </div>
        </div>
      </div>
    </ErrorBoundary>
  );
};

export default Profile;
