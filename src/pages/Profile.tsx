
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useParams } from 'react-router-dom';
import InstagramProfile from '@/components/profile/InstagramProfile';

const Profile = () => {
  const { user } = useAuth();
  const { userId } = useParams<{ userId?: string }>();
  
  // Use the userId from params, or fallback to current user's ID
  const profileUserId = userId || user?.id;
  
  if (!profileUserId) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white">Please log in to view your profile</div>
      </div>
    );
  }

  return <InstagramProfile />;
};

export default Profile;
