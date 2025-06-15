
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, MessageCircle, Share, Clock, MapPin, Star } from 'lucide-react';
import OnlineStatus from '@/components/OnlineStatus';

export interface ProviderData {
  id: string;
  display_name: string;
  bio: string;
  location: string;
  whatsapp: string;
  profile_image_url: string;
  profile_images: string[];
  serviceCategory?: string;
  services?: string[];
  rating?: number;
  reviewCount?: number;
  isAvailable?: boolean;
}

interface Props {
  provider: ProviderData;
  onBack: () => void;
}

const renderStars = (rating: number) => {
  return Array.from({ length: 5 }, (_, index) => (
    <Star
      key={index}
      className={`w-4 h-4 ${index < Math.floor(rating) ? 'text-yellow-400 fill-current' : 'text-gray-400'}`}
    />
  ));
};

const ProviderProfileHeader = ({ provider, onBack }: Props) => {
  const handleContact = () => {
    if (provider?.whatsapp) {
      const num = provider.whatsapp.replace(/[^0-9]/g, "");
      const message = encodeURIComponent("Hi, I got your number from ConnectsBuddy looking for hook up services/content.");
      window.open(`https://wa.me/${num}?text=${message}`, '_blank');
    }
  };

  return (
    <div className="sticky top-0 z-10 bg-black/80 backdrop-blur-md border-b border-gray-700">
      <div className="flex items-center justify-between p-4 max-w-4xl mx-auto">
        <Button
          onClick={onBack}
          variant="ghost"
          className="text-white hover:bg-white/10"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        <h1 className="text-xl font-bold text-white">{provider.display_name}</h1>
        <div className="flex space-x-2">
          <Button
            onClick={handleContact}
            size="sm"
            className="bg-green-600 hover:bg-green-700"
          >
            <MessageCircle className="w-4 h-4" />
            WhatsApp
          </Button>
          <Button variant="ghost" size="sm" className="text-white">
            <Share className="w-4 h-4" />
          </Button>
        </div>
      </div>
      {/* Profile Card header visuals */}
      <div className="max-w-4xl mx-auto p-6">
        <div className="flex items-start space-x-6">
          <div className="relative">
            <img
              src={provider.profile_image_url || '/placeholder.svg'}
              alt={provider.display_name}
              className="w-32 h-32 rounded-full object-cover"
            />
            <OnlineStatus 
              isOnline={true} // This could be passed as a prop if needed
              size="lg"
              className="absolute -bottom-2 -right-2"
            />
          </div>
          <div className="flex-1">
            <div className="flex items-center space-x-3 mb-2">
              <h1 className="text-3xl font-bold text-white">{provider.display_name}</h1>
              <Badge variant="secondary" className="bg-purple-600 text-white">Provider</Badge>
              {provider.isAvailable && (
                <Badge className="bg-green-600 text-white">
                  <Clock className="w-3 h-3 mr-1" />
                  Available
                </Badge>
              )}
            </div>
            {provider.serviceCategory && (
              <Badge className="bg-blue-600 text-white mb-3">
                {provider.serviceCategory}
              </Badge>
            )}
            <div className="flex items-center space-x-4 mb-3">
              {provider.rating && (
                <div className="flex items-center space-x-2">
                  <div className="flex items-center">
                    {renderStars(provider.rating)}
                  </div>
                  <span className="text-yellow-400 font-semibold">{provider.rating.toFixed(1)}</span>
                  {provider.reviewCount && (
                    <span className="text-gray-400 text-sm">({provider.reviewCount} reviews)</span>
                  )}
                </div>
              )}
            </div>
            <div className="flex items-center text-gray-400 text-sm mb-4">
              <MapPin className="w-4 h-4 mr-1" />
              {provider.location}
            </div>
            {/* Actions can go here if needed */}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProviderProfileHeader;

