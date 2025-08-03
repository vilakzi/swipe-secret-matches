
import { Button } from '@/components/ui/button';
import { Heart, MessageCircle, Phone, Star, Crown } from 'lucide-react';
import { useUserRole } from '@/hooks/useUserRole';
import { toast } from '@/hooks/use-toast';

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
  onWhatsAppClick?: (e: React.MouseEvent) => void; // add optional for new prop
}

const ProviderActions = ({ 
  profile, 
  itemId, 
  likedItems, 
  onLike, 
  onContact, 
  onPhoneClick,
  onWhatsAppClick
}: ProviderActionsProps) => {
  const { isServiceProvider, isAdmin } = useUserRole();

  const handleSuperPromotion = (e: React.MouseEvent) => {
    e.stopPropagation();
    // Super promotion functionality placeholder
    toast({
      title: "Feature Coming Soon",
      description: "Super promotion feature will be available soon!",
    });
  };

  return (
    <div className="p-4 pt-2">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="icon"
            className={`p-0 rounded-full ${likedItems.has(itemId) ? 'text-red-500 bg-pink-50 hover:bg-pink-100' : 'text-white bg-transparent hover:bg-gray-700'}`}
            onClick={onLike}
            title={likedItems.has(itemId) ? "Unlike" : "Like"}
          >
            <Heart className={`w-5 h-5 ${likedItems.has(itemId) ? 'fill-current' : ''}`} />
          </Button>
          {/* WhatsApp button (circle, green, always visible if WhatsApp available) */}
          {profile.whatsapp && (
            <Button
              variant="ghost"
              size="icon"
              className="p-0 rounded-full bg-green-600 hover:bg-green-700 text-white transition-colors"
              style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.07)' }}
              onClick={onWhatsAppClick}
              title="Contact via WhatsApp"
              aria-label="Contact via WhatsApp"
            >
              {/* Use Phone for now, ideally use 'whatsapp' from lucide-react */}
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-5 h-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path d="M16.862 14.776c-.254-.127-1.5-.772-1.73-.862-.232-.088-.401-.126-.574.127-.172.254-.662.862-.812 1.037-.147.17-.298.192-.553.064-.254-.127-1.074-.396-2.044-1.262-.757-.675-1.27-1.51-1.419-1.765-.148-.255-.016-.39.112-.516.116-.115.257-.297.386-.447.13-.15.173-.254.257-.423.085-.169.043-.318-.021-.445-.063-.127-.574-1.382-.785-1.891-.207-.5-.418-.432-.573-.44-.147-.007-.319-.009-.49-.009-.17 0-.447.064-.683.297-.234.235-.89.87-.89 2.115 0 1.246.912 2.43 1.04 2.6.129.17 1.791 2.739 4.354 3.729.609.219 1.084.35 1.453.448.61.163 1.163.14 1.604.085.49-.062 1.5-.613 1.712-1.205.212-.59.212-1.095.148-1.205-.064-.113-.236-.183-.49-.31z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </Button>
          )}
        </div>
        
        <div className="flex items-center space-x-1">
          {(isServiceProvider || isAdmin) && (
            <Button
              variant="ghost"
              size="icon"
              className="text-yellow-400 hover:text-yellow-300 p-0"
              onClick={handleSuperPromotion}
              title="Super Promote Provider"
            >
              <Crown className="w-5 h-5" />
            </Button>
          )}
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
