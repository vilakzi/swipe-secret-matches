
import { Button } from '@/components/ui/button';
import { Images, User } from 'lucide-react';

interface ProviderImageProps {
  image: string;
  name: string;
  portfolio?: string[];
  onProfileClick: () => void;
  onPortfolioToggle: (e: React.MouseEvent) => void;
}

const ProviderImage = ({ image, name, portfolio, onProfileClick, onPortfolioToggle }: ProviderImageProps) => {
  return (
    <div className="relative">
      <img
        src={image}
        alt={name}
        className="w-full h-80 object-cover hover:opacity-95 transition-opacity cursor-pointer"
        onClick={onProfileClick}
      />
      
      {/* Portfolio Button Overlay */}
      {portfolio && portfolio.length > 0 && (
        <Button
          variant="secondary"
          size="sm"
          className="absolute top-2 right-2 bg-black/60 hover:bg-black/80 text-white z-10"
          onClick={onPortfolioToggle}
        >
          <Images className="w-4 h-4 mr-1" />
          Portfolio ({portfolio.length})
        </Button>
      )}

      {/* Click to view profile overlay */}
      <div 
        className="absolute inset-0 bg-black/0 hover:bg-black/20 transition-colors flex items-center justify-center opacity-0 hover:opacity-100 cursor-pointer z-5"
        onClick={onProfileClick}
      >
        <Button className="bg-purple-600 hover:bg-purple-700">
          <User className="w-4 h-4 mr-2" />
          View Full Profile
        </Button>
      </div>
    </div>
  );
};

export default ProviderImage;
