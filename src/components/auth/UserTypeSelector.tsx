
import React from 'react';
import { Button } from '@/components/ui/button';
import { User, Briefcase, Shield } from 'lucide-react';

interface UserTypeSelectorProps {
  userType: 'user' | 'service_provider';
  isAdmin: boolean;
  onUserTypeChange: (userType: 'user' | 'service_provider') => void;
  onAdminToggle: () => void;
}

const UserTypeSelector: React.FC<UserTypeSelectorProps> = ({
  userType,
  isAdmin,
  onUserTypeChange,
  onAdminToggle,
}) => {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-300 mb-2">
        Account Type
      </label>
      <div className="grid grid-cols-3 gap-2">
        <Button
          type="button"
          variant={userType === 'user' && !isAdmin ? "default" : "outline"}
          className="flex items-center justify-center space-x-2"
          onClick={() => onUserTypeChange('user')}
        >
          <User className="w-4 h-4" />
          <span>User</span>
        </Button>
        <Button
          type="button"
          variant={userType === 'service_provider' && !isAdmin ? "default" : "outline"}
          className="flex items-center justify-center space-x-2"
          onClick={() => onUserTypeChange('service_provider')}
        >
          <Briefcase className="w-4 h-4" />
          <span>Provider</span>
        </Button>
        <Button
          type="button"
          variant={isAdmin ? "default" : "outline"}
          className="flex items-center justify-center space-x-2"
          onClick={onAdminToggle}
        >
          <Shield className="w-4 h-4" />
          <span>Admin</span>
        </Button>
      </div>
    </div>
  );
};

export default UserTypeSelector;
