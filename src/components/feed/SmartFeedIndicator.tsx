
import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowUp, Sparkles } from 'lucide-react';

interface SmartFeedIndicatorProps {
  queueCount: number;
  onRefresh: () => void;
  className?: string;
}

const SmartFeedIndicator: React.FC<SmartFeedIndicatorProps> = ({
  queueCount,
  onRefresh,
  className = ''
}) => {
  if (queueCount === 0) return null;

  return (
    <div className={`fixed top-20 left-1/2 transform -translate-x-1/2 z-50 ${className}`}>
      <Button
        onClick={onRefresh}
        className="bg-blue-500 hover:bg-blue-600 text-white shadow-lg rounded-full px-4 py-2 flex items-center space-x-2 animate-fade-in"
        size="sm"
      >
        <ArrowUp className="w-4 h-4" />
        <Sparkles className="w-4 h-4" />
        <span className="font-medium">
          {queueCount === 1 ? '1 new post' : `${queueCount} new posts`}
        </span>
      </Button>
    </div>
  );
};

export default SmartFeedIndicator;
