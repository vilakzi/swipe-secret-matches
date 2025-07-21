import React from 'react';
import { Button } from '@/components/ui/button';
import { RefreshCw, ArrowUp } from 'lucide-react';

interface UpdateIndicatorProps {
  hasUpdates: boolean;
  updateCount: number;
  onApplyUpdates: () => void;
  className?: string;
}

const UpdateIndicator: React.FC<UpdateIndicatorProps> = ({
  hasUpdates,
  updateCount,
  onApplyUpdates,
  className = ''
}) => {
  if (!hasUpdates || updateCount === 0) {
    return null;
  }

  return (
    <div className={`fixed top-24 left-1/2 transform -translate-x-1/2 z-40 ${className}`}>
      <Button
        onClick={onApplyUpdates}
        className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-full shadow-lg border border-purple-500/30 backdrop-blur-sm"
        size="sm"
      >
        <ArrowUp className="w-4 h-4 mr-2" />
        {updateCount} new update{updateCount > 1 ? 's' : ''}
      </Button>
    </div>
  );
};

export default UpdateIndicator;