
import React from 'react';
import { Circle } from 'lucide-react';

interface OnlineStatusProps {
  isOnline: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const OnlineStatus = ({ isOnline, size = 'sm', className = '' }: OnlineStatusProps) => {
  const sizeClasses = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5'
  };

  return (
    <div className={`relative ${className}`}>
      <Circle 
        className={`${sizeClasses[size]} ${
          isOnline ? 'text-green-500 fill-green-500' : 'text-red-500 fill-red-500'
        }`}
      />
      {isOnline && (
        <div className={`absolute inset-0 ${sizeClasses[size]} bg-green-400 rounded-full animate-ping opacity-75`} />
      )}
    </div>
  );
};

export default OnlineStatus;
