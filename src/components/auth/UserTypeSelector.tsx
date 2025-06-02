
import React, { useState, useEffect } from 'react';
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
  const [pressedButton, setPressedButton] = useState<string | null>(null);

  const handleUserClick = () => {
    setPressedButton('user');
    onUserTypeChange('user');
  };

  const handleProviderClick = () => {
    setPressedButton('service_provider');
    onUserTypeChange('service_provider');
  };

  const handleAdminClick = () => {
    setPressedButton('admin');
    onAdminToggle();
  };

  // Reset pressed state after animation
  useEffect(() => {
    if (pressedButton) {
      const timer = setTimeout(() => setPressedButton(null), 200);
      return () => clearTimeout(timer);
    }
  }, [pressedButton]);

  return (
    <div>
      <label className="block text-sm font-medium text-gray-300 mb-2">
        Account Type
      </label>
      <div className="grid grid-cols-3 gap-2">
        <Button
          type="button"
          variant={userType === 'user' && !isAdmin ? "default" : "outline"}
          className={`flex items-center justify-center space-x-2 transition-all duration-200 ${
            userType === 'user' && !isAdmin 
              ? 'bg-purple-600 hover:bg-purple-700 text-white shadow-lg' 
              : 'border-gray-600 text-gray-300 hover:text-white hover:bg-gray-700/50 hover:border-purple-500'
          } ${
            pressedButton === 'user' 
              ? 'scale-95 bg-purple-700 shadow-xl' 
              : ''
          }`}
          onClick={handleUserClick}
        >
          <User className="w-4 h-4" />
          <span className="text-sm font-medium">User</span>
        </Button>
        
        <Button
          type="button"
          variant={userType === 'service_provider' && !isAdmin ? "default" : "outline"}
          className={`flex items-center justify-center space-x-2 transition-all duration-200 ${
            userType === 'service_provider' && !isAdmin 
              ? 'bg-purple-600 hover:bg-purple-700 text-white shadow-lg' 
              : 'border-gray-600 text-gray-300 hover:text-white hover:bg-gray-700/50 hover:border-purple-500'
          } ${
            pressedButton === 'service_provider' 
              ? 'scale-95 bg-purple-700 shadow-xl' 
              : ''
          }`}
          onClick={handleProviderClick}
        >
          <Briefcase className="w-4 h-4" />
          <span className="text-sm font-medium">Provider</span>
        </Button>
        
        <Button
          type="button"
          variant={isAdmin ? "default" : "outline"}
          className={`flex items-center justify-center space-x-2 transition-all duration-200 ${
            isAdmin 
              ? 'bg-purple-600 hover:bg-purple-700 text-white shadow-lg' 
              : 'border-gray-600 text-gray-300 hover:text-white hover:bg-gray-700/50 hover:border-purple-500'
          } ${
            pressedButton === 'admin' 
              ? 'scale-95 bg-purple-700 shadow-xl' 
              : ''
          }`}
          onClick={handleAdminClick}
        >
          <Shield className="w-4 h-4" />
          <span className="text-sm font-medium">Admin</span>
        </Button>
      </div>
    </div>
  );
};

export default UserTypeSelector;
