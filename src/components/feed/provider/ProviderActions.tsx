
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Heart, MessageCircle, Phone, Share } from 'lucide-react';

interface Profile {
  id: number;
  name: string;
  bio: string;
  isAvailable?: boolean;
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
