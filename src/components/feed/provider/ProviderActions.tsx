
import { Button } from '@/components/ui/button';
import { Heart, MessageCircle, Phone, Star, Crown } from 'lucide-react';
import { useUserRole } from '@/hooks/useUserRole';

interface Profile {
  id: string;
  name: string;
  whatsapp: string;
  isRealAccount?: boolean;
}

interface ProviderActionsProps {
  profile: Profile;
  itemId: string;
  likedItems: Set<string>;
  onLike: (e: React.MouseEvent) => void;
  onContact: (e: React.MouseEvent) => void;
  onPhoneClick: (e: React.MouseEvent) => void;
}

const ProviderActions = ({ 
  profile, 
  itemId, 
  likedItems, 
  onLike, 
  onContact, 
  onPhoneClick 
}: ProviderActionsProps) => {
  const { isServiceProvider, isAdmin } = useUserRole();

  const handleSuperPromotion = (e: React.MouseEvent) => {
    e.stopPropagation();
    // TODO: Implement super promotion logic
    console.log('Super promotion clicked for provider:', profile.id);
  };

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="sm"
            className={`p-0 ${likedItems.has(itemId) ? 'text-red-500' : 'text-white'}`}
            onClick={onLike}
          >
            <Heart className={`w-6 h-6 ${likedItems.has(itemId) ? 'fill-current' : ''}`} />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="text-white p-0"
            onClick={onContact}
          >
            <MessageCircle className="w-6 h-6" />
          </Button>
          {profile.whatsapp && (
            <Button
              variant="ghost"
              size="sm"
              className="text-green-400 p-0"
              onClick={onPhoneClick}
            >
              <Phone className="w-6 h-6" />
            </Button>
          )}
        </div>
        
        <div className="flex items-center space-x-2">
          {(isServiceProvider || isAdmin) && (
            <Button
              variant="ghost"
              size="sm"
              className="text-yellow-400 p-0 hover:text-yellow-300"
              onClick={handleSuperPromotion}
              title="Super Promote Provider"
            >
              <Crown className="w-5 h-5" />
            </Button>
          )}
          <Button
            variant="ghost"
            size="sm"
            className="text-white"
            onClick={onContact}
          >
            Contact
          </Button>
        </div>
      </div>

      {profile.isRealAccount && (
        <div className="text-center">
          <div className="flex items-center justify-center space-x-1 text-blue-400 text-xs">
            <Star className="w-3 h-3 fill-current" />
            <span>Verified Provider</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProviderActions;
