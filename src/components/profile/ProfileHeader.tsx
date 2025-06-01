
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Edit } from 'lucide-react';

interface ProfileHeaderProps {
  onEditClick: () => void;
}

const ProfileHeader = ({ onEditClick }: ProfileHeaderProps) => {
  const navigate = useNavigate();

  return (
    <div className="flex items-center justify-between mb-6">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => navigate('/')}
        className="text-white hover:bg-white/10"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back
      </Button>
      <div className="flex space-x-2">
        <Button
          variant="outline"
          size="sm"
          onClick={onEditClick}
          className="text-white border-gray-600 hover:bg-white/10"
        >
          <Edit className="w-4 h-4 mr-2" />
          Edit Profile
        </Button>
      </div>
    </div>
  );
};

export default ProfileHeader;
