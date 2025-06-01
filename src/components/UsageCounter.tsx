
import React from 'react';
import { Progress } from '@/components/ui/progress';
import { Zap } from 'lucide-react';

interface UsageCounterProps {
  currentUsage: number;
  maxUsage: number;
  type: 'swipes' | 'super_likes';
}

const UsageCounter = ({ currentUsage, maxUsage, type }: UsageCounterProps) => {
  const percentage = (currentUsage / maxUsage) * 100;
  const remaining = maxUsage - currentUsage;

  return (
    <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center">
          <Zap className="w-4 h-4 text-yellow-500 mr-2" />
          <span className="text-white font-medium">
            {type === 'swipes' ? 'Daily Swipes' : 'Super Likes'}
          </span>
        </div>
        <span className="text-gray-400 text-sm">
          {remaining} left
        </span>
      </div>
      
      <Progress 
        value={percentage} 
        className="h-2 mb-2"
      />
      
      <div className="flex justify-between text-xs text-gray-400">
        <span>{currentUsage} used</span>
        <span>{maxUsage} total</span>
      </div>
      
      {remaining === 0 && (
        <p className="text-yellow-500 text-xs mt-2">
          {type === 'swipes' ? 'Daily limit reached. Come back tomorrow!' : 'Out of super likes!'}
        </p>
      )}
    </div>
  );
};

export default UsageCounter;
