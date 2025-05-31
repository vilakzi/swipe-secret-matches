
import React from 'react';
import { Button } from '@/components/ui/button';

interface AuthToggleProps {
  isLogin: boolean;
  onToggle: (isLogin: boolean) => void;
}

const AuthToggle: React.FC<AuthToggleProps> = ({ isLogin, onToggle }) => {
  return (
    <div className="flex mb-6">
      <Button
        type="button"
        variant={isLogin ? "default" : "ghost"}
        className="flex-1 mr-2"
        onClick={() => onToggle(true)}
      >
        Sign In
      </Button>
      <Button
        type="button"
        variant={!isLogin ? "default" : "ghost"}
        className="flex-1 ml-2"
        onClick={() => onToggle(false)}
      >
        Sign Up
      </Button>
    </div>
  );
};

export default AuthToggle;
