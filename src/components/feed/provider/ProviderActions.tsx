
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Heart, MessageCircle, Phone, Share } from 'lucide-react';

interface Profile {
  id: string;
  name: string;
  bio: string;
  isAvailable?: boolean;
  phone?: string;
  whatsapp?: string;
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
  
  const handleWhatsAppClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    const phoneNumber = profile.phone || profile.whatsapp;
    if (phoneNumber) {
      const cleanPhone = phoneNumber.replace(/[^\d+]/g, '');
      const message = encodeURIComponent(`Hi ${profile.name}! I saw your profile and would love to chat about your services.`);
      window.open(`https://wa.me/${cleanPhone}?text=${message}`, '_blank');
    }
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
          <Button
            variant="ghost"
            size="sm"
            className="text-white p-0"
            onClick={onPhoneClick}
          >
            <Phone className="w-6 h-6" />
          </Button>
          {(profile.phone || profile.whatsapp) && (
            <Button
              variant="ghost"
              size="sm"
              className="text-green-500 p-0 hover:text-green-400"
              onClick={handleWhatsAppClick}
              title="Contact via WhatsApp"
            >
              <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/>
              </svg>
            </Button>
          )}
          <Button
            variant="ghost"
            size="sm"
            className="text-white p-0"
          >
            <Share className="w-6 h-6" />
          </Button>
        </div>
        <div className="flex items-center space-x-2">
          {profile.isAvailable ? (
            <Badge className="bg-green-600 text-white">Available</Badge>
          ) : (
            <Badge variant="outline" className="border-gray-600 text-gray-400">Busy</Badge>
          )}
        </div>
      </div>

      {/* Bio */}
      <div className="text-white">
        <span className="font-semibold">{profile.name}</span>
        <span className="ml-2 text-gray-300">{profile.bio}</span>
      </div>
    </div>
  );
};

export default ProviderActions;
