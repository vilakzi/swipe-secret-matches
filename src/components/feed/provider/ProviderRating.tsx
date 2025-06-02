
import { Star } from 'lucide-react';

interface ProviderRatingProps {
  rating: number;
  reviewCount?: number;
}

const ProviderRating = ({ rating, reviewCount }: ProviderRatingProps) => {
  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, index) => (
      <Star
        key={index}
        className={`w-4 h-4 ${
          index < Math.floor(rating) ? 'text-yellow-400 fill-current' : 'text-gray-400'
        }`}
      />
    ));
  };

  return (
    <div className="px-4 pb-2 flex items-center space-x-2">
      <div className="flex items-center">
        {renderStars(rating)}
      </div>
      <span className="text-yellow-400 font-semibold">{rating.toFixed(1)}</span>
      {reviewCount && (
        <span className="text-gray-400 text-sm">({reviewCount} reviews)</span>
      )}
    </div>
  );
};

export default ProviderRating;
