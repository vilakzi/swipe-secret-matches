
import React from 'react';

interface AuthFooterProps {
  isLogin: boolean;
  onToggle: () => void;
}

const AuthFooter: React.FC<AuthFooterProps> = ({ isLogin, onToggle }) => {
  return (
    <div className="mt-6 text-center">
      <p className="text-gray-400 text-sm">
        {isLogin ? "Don't have an account? " : "Already have an account? "}
        <button
          type="button"
          onClick={onToggle}
          className="text-purple-400 hover:text-purple-300 font-medium"
        >
          {isLogin ? "Sign up" : "Sign in"}
        </button>
      </p>
    </div>
  );
};

export default AuthFooter;
