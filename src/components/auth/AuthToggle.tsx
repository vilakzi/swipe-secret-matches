
import * as React from 'react';

interface AuthToggleProps {
  isLogin: boolean;
  onToggle: (isLogin: boolean) => void;
}

const AuthToggle = ({ isLogin, onToggle }: AuthToggleProps) => {
  return (
    <div className="flex mb-6 bg-gray-800/50 rounded-lg p-1">
      <button
        type="button"
        className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all duration-200 ${
          isLogin
            ? 'bg-purple-600 text-white shadow-md transform scale-105'
            : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
        }`}
        onClick={() => onToggle(true)}
      >
        Sign In
      </button>
      <button
        type="button"
        className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all duration-200 ${
          !isLogin
            ? 'bg-purple-600 text-white shadow-md transform scale-105'
            : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
        }`}
        onClick={() => onToggle(false)}
      >
        Sign Up
      </button>
    </div>
  );
};

export default AuthToggle;
