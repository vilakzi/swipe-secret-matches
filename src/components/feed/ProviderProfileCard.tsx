import { Card } from '@/components/ui/card';
import { usePresence } from '@/hooks/usePresence';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ProviderHeader from './provider/ProviderHeader';
import ProviderRating from './provider/ProviderRating';
import ProviderServices from './provider/ProviderServices';
import ProviderImage from './provider/ProviderImage';
import ProviderPortfolio from './provider/ProviderPortfolio';
import ProviderActions from './provider/ProviderActions';

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
  isRealAccount?: boolean;
}

interface FeedItem {
  id: string;
  type: 'profile' | 'post';
  profile: Profile;
  postImage?: string;
  caption?: string;
}

interface ProviderProfileCardProps {
  item: FeedItem;
  likedItems: Set<string>;
  isSubscribed: boolean;
  onLike: (itemId: string, profileId: string) => void;
  onContact: (profile: Profile) => void;
}

const ProviderProfileCard = ({ item, likedItems, isSubscribed, onLike, onContact }: ProviderProfileCardProps) => {
  const { isUserOnline } = usePresence();
  const navigate = useNavigate();
  const [showPortfolio, setShowPortfolio] = useState(false);

  const handleProfileClick = () => {
    console.log('Navigating to provider profile:', item.profile.id);
    navigate(`/provider/${item.profile.id}`);
  };

  const handleLike = (e: React.MouseEvent) => {
    e.stopPropagation();
    console.log('Like clicked for item:', item.id);
    onLike(item.id, item.profile.id);
  };

  const handleContact = (e: React.MouseEvent) => {
    e.stopPropagation();
    console.log('Contact clicked for provider:', item.profile.name);
    onContact(item.profile);
  };

  const handlePhoneClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    console.log('Phone clicked for provider:', item.profile.whatsapp);
    window.open(`tel:${item.profile.whatsapp}`, '_self');
  };

  const handlePortfolioToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    console.log('Portfolio toggle clicked');
    setShowPortfolio(!showPortfolio);
  };

  // Open WhatsApp with preset message for providers
  const handleWhatsAppClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    const num = item.profile.whatsapp?.replace(/[^0-9]/g, "");
    if (num) {
      const message = encodeURIComponent("Hi, I got your number from ConnectsBuddy looking for hook up services/content.");
      window.open(`https://wa.me/${num}?text=${message}`, '_blank');
    }
  };

  return (
    <Card className="bg-gray-800 border-gray-700 mb-4">
      <ProviderHeader
        profile={item.profile}
        isOnline={isUserOnline(item.profile.id.toString())}
        isSubscribed={isSubscribed}
        onProfileClick={handleProfileClick}
      />

      <ProviderServices
        serviceCategory={item.profile.serviceCategory}
        services={item.profile.services}
      />

      {item.profile.rating && (
        <ProviderRating
          rating={item.profile.rating}
          reviewCount={item.profile.reviewCount}
        />
      )}

      <ProviderImage
        image={item.profile.image}
        name={item.profile.name}
        portfolio={item.profile.portfolio}
        onProfileClick={handleProfileClick}
        onPortfolioToggle={handlePortfolioToggle}
      />

      {showPortfolio && item.profile.portfolio && (
        <ProviderPortfolio
          portfolio={item.profile.portfolio}
          onImageClick={handleProfileClick}
        />
      )}

      {/* WhatsApp Button forced for providers */}
      <div className="flex justify-end px-4 pb-4">
        <button
          onClick={handleWhatsAppClick}
          className="bg-green-600 hover:bg-green-700 text-white rounded px-4 py-2 flex items-center"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path d="M16.862 14.776c-.254-.127-1.5-.772-1.73-.862-.232-.088-.401-.126-.574.127-.172.254-.662.862-.812 1.037-.147.17-.298.192-.553.064-.254-.127-1.074-.396-2.044-1.262-.757-.675-1.27-1.51-1.419-1.765-.148-.255-.016-.39.112-.516.116-.115.257-.297.386-.447.13-.15.173-.254.257-.423.085-.169.043-.318-.021-.445-.063-.127-.574-1.382-.785-1.891-.207-.5-.418-.432-.573-.44-.147-.007-.319-.009-.49-.009-.17 0-.447.064-.683.297-.234.235-.89.87-.89 2.115 0 1.246.912 2.43 1.04 2.6.129.17 1.791 2.739 4.354 3.729.609.219 1.084.35 1.453.448.61.163 1.163.14 1.604.085.49-.062 1.5-.613 1.712-1.205.212-.59.212-1.095.148-1.205-.064-.113-.236-.183-.49-.31z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          WhatsApp
        </button>
      </div>

      <ProviderActions
        profile={item.profile}
        itemId={item.id}
        likedItems={likedItems}
        onLike={handleLike}
        onContact={handleContact}
        onPhoneClick={handlePhoneClick}
      />
    </Card>
  );
};

export default ProviderProfileCard;
