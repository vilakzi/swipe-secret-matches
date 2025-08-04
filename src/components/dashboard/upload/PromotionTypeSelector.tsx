import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Clock, Crown } from 'lucide-react';

type PromotionType = 'free_2h' | 'paid_8h' | 'paid_12h';

interface PromotionTypeSelectorProps {
  promotionType: PromotionType;
  onPromotionTypeChange: (type: PromotionType) => void;
}

const PromotionTypeSelector: React.FC<PromotionTypeSelectorProps> = ({ promotionType, onPromotionTypeChange }) => {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-300 mb-2">
        Promotion Type
      </label>
      <div className="grid grid-cols-3 gap-2">
        <Button
          type="button"
          variant={promotionType === 'free_2h' ? "default" : "outline"}
          className="flex flex-col items-center p-4 h-auto"
          onClick={() => onPromotionTypeChange('free_2h')}
          aria-pressed={promotionType === 'free_2h'}
          aria-label="Select Free 2 Hours Promotion"
        >
          <Clock className="w-5 h-5 mb-1" />
          <span className="text-sm">2 Hours</span>
          <span className="text-xs text-green-400">Free</span>
        </Button>
        <Button
          type="button"
          variant={promotionType === 'paid_8h' ? "default" : "outline"}
          className="flex flex-col items-center p-4 h-auto"
          onClick={() => onPromotionTypeChange('paid_8h')}
          aria-pressed={promotionType === 'paid_8h'}
          aria-label="Select Paid 8 Hours Promotion"
        >
          <Crown className="w-5 h-5 mb-1" />
          <span className="text-sm">8 Hours</span>
          <span className="text-xs text-yellow-400">R20</span>
        </Button>
        <Button
          type="button"
          variant={promotionType === 'paid_12h' ? "default" : "outline"}
          className="flex flex-col items-center p-4 h-auto"
          onClick={() => onPromotionTypeChange('paid_12h')}
          aria-pressed={promotionType === 'paid_12h'}
          aria-label="Select Paid 12 Hours Promotion"
        >
          <Crown className="w-5 h-5 mb-1" />
          <span className="text-sm">12 Hours</span>
          <span className="text-xs text-purple-400">R39</span>
        </Button>
      </div>
    </div>
  );
};

export default PromotionTypeSelector;