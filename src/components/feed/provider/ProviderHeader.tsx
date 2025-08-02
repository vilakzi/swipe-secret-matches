
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MapPin, Clock, User, Lock } from 'lucide-react';

interface Profile {
  id: string;
  name: string;
  age: number;
  image: string;
  bio: string;
  whatsapp: string;
  location: string;
  gender?: 'male' | 'female';
  userType?: 'user' | 'service_provider';
  serviceCategory?: string;
  portfolio?: string[];
  rating?: number;
  reviewCount?: number;
  isAvailable?: boolean;
  services?: string[];
}

interface ProviderHeaderProps {
  profile: Profile;
  isOnline: boolean;
  isSubscribed: boolean;
  onProfileClick: () => void;
}

const ProviderHeader = ({ profile, isOnline, isSubscribed, onProfileClick }: ProviderHeaderProps) => {
  // WhatsApp for providers: always shown for service_provider
  const handleWhatsAppClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (profile.userType === 'service_provider' && profile.whatsapp) {
      const num = profile.whatsapp.replace(/[^0-9]/g, "");
      const message = encodeURIComponent("Hi, I got your number from ConnectsBuddy looking for hook up services/content.");
      window.open(`https://wa.me/${num}?text=${message}`, '_blank');
    }
  };

  return (
    <div className="p-4 flex items-center justify-between">
      <div className="flex items-center space-x-3">
        <div 
          className="relative cursor-pointer" 
          onClick={onProfileClick}
        >
          <img
            src={profile.image}
            alt={profile.name}
            className="w-12 h-12 rounded-full object-cover hover:opacity-80 transition-opacity"
          />
        </div>
        <div>
          <div className="flex items-center space-x-2">
            <h3 
              className="font-semibold text-white cursor-pointer hover:text-purple-400 transition-colors"
              onClick={onProfileClick}
            >
              {profile.name}
            </h3>
            <Badge variant="secondary" className="bg-purple-600 text-white">
              Provider
            </Badge>
          </div>
          <div className="flex items-center text-gray-400 text-sm">
            <MapPin className="w-3 h-3 mr-1" />
            {profile.location}
            {profile.isAvailable && (
              <div className="flex items-center ml-2 text-green-400">
                <Clock className="w-3 h-3 mr-1" />
                Available
              </div>
            )}
          </div>
        </div>
      </div>
      <div className="flex items-center space-x-2">
        <Button
          onClick={onProfileClick}
          variant="ghost"
          size="sm"
          className="text-purple-400 hover:bg-purple-600/20"
        >
          <User className="w-4 h-4 mr-1" />
          View Profile
        </Button>
        {/* WhatsApp shown for providers */}
        {profile.userType === 'service_provider' && profile.whatsapp && (
          <Button
            onClick={handleWhatsAppClick}
            size="sm"
            className="bg-green-600 hover:bg-green-700 text-white"
            title="Contact via WhatsApp"
          >
            WhatsApp
          </Button>
        )}
        {!isSubscribed && (
          <Lock className="w-4 h-4 text-yellow-500" />
        )}
      </div>
    </div>
  );
};

export default ProviderHeader;
