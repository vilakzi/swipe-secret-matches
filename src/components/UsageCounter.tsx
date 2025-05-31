
import { Card } from '@/components/ui/card';
import { Eye, Crown } from 'lucide-react';

interface UsageCounterProps {
  scrollsToday: number;
  remainingScrolls: number;
  isSubscribed: boolean;
}

const UsageCounter = ({ scrollsToday, remainingScrolls, isSubscribed }: UsageCounterProps) => {
  if (isSubscribed) {
    return (
      <Card className="bg-gradient-to-r from-purple-600/20 to-pink-600/20 border-purple-500/30 p-3">
        <div className="flex items-center justify-center space-x-2 text-purple-300">
          <Crown className="w-4 h-4" />
          <span className="text-sm font-medium">Premium - Unlimited Access</span>
        </div>
      </Card>
    );
  }

  const percentage = (scrollsToday / 5) * 100;
  const isNearLimit = remainingScrolls <= 1;

  return (
    <Card className={`border p-3 ${
      isNearLimit 
        ? 'bg-red-500/10 border-red-500/30' 
        : 'bg-gray-800/50 border-gray-600'
    }`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Eye className={`w-4 h-4 ${isNearLimit ? 'text-red-400' : 'text-gray-400'}`} />
          <span className={`text-sm ${isNearLimit ? 'text-red-300' : 'text-gray-300'}`}>
            Daily Views
          </span>
        </div>
        <div className={`text-sm font-medium ${isNearLimit ? 'text-red-300' : 'text-gray-300'}`}>
          {scrollsToday}/5
        </div>
      </div>
      
      {/* Progress Bar */}
      <div className="mt-2 w-full bg-gray-700 rounded-full h-2">
        <div 
          className={`h-2 rounded-full transition-all duration-300 ${
            isNearLimit 
              ? 'bg-gradient-to-r from-red-500 to-red-600' 
              : 'bg-gradient-to-r from-purple-500 to-pink-500'
          }`}
          style={{ width: `${Math.min(percentage, 100)}%` }}
        />
      </div>
      
      {remainingScrolls === 0 && (
        <div className="mt-2 text-center">
          <span className="text-xs text-red-400">
            Limit reached - Subscribe for unlimited access
          </span>
        </div>
      )}
    </Card>
  );
};

export default UsageCounter;
