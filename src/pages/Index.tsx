
import { useState, useEffect } from 'react';
import ProfileCard from '../components/ProfileCard';
import MatchModal from '../components/MatchModal';
import PaymentModal from '../components/PaymentModal';
import { Heart, X, Settings, User } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Profile {
  id: number;
  name: string;
  age: number;
  image: string;
  bio: string;
  whatsapp: string;
  location: string;
}

const mockProfiles: Profile[] = [
  {
    id: 1,
    name: "Emma",
    age: 28,
    image: "https://images.unsplash.com/photo-1494790108755-2616b612b566?w=400&h=600&fit=crop",
    bio: "Love hiking and good coffee ☕",
    whatsapp: "+27123456789",
    location: "Cape Town"
  },
  {
    id: 2,
    name: "Sarah",
    age: 25,
    image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=600&fit=crop",
    bio: "Adventure seeker and wine enthusiast 🍷",
    whatsapp: "+27987654321",
    location: "Johannesburg"
  },
  {
    id: 3,
    name: "Lisa",
    age: 30,
    image: "https://images.unsplash.com/photo-1534751516642-a1af1ef26a56?w=400&h=600&fit=crop",
    bio: "Yoga instructor & nature lover 🧘‍♀️",
    whatsapp: "+27555123456",
    location: "Durban"
  },
  {
    id: 4,
    name: "Maria",
    age: 27,
    image: "https://images.unsplash.com/photo-1488716820095-cbe80883c496?w=400&h=600&fit=crop",
    bio: "Photographer capturing life's moments 📸",
    whatsapp: "+27444987654",
    location: "Pretoria"
  }
];

const Index = () => {
  const [profiles, setProfiles] = useState<Profile[]>(mockProfiles);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [matches, setMatches] = useState<Profile[]>([]);
  const [showMatch, setShowMatch] = useState(false);
  const [lastMatch, setLastMatch] = useState<Profile | null>(null);
  const [showPayment, setShowPayment] = useState(false);
  const [isSwipingDisabled, setIsSwipingDisabled] = useState(false);
  const [swipeCount, setSwipeCount] = useState(0);

  const currentProfile = profiles[currentIndex];

  const handleSwipe = (direction: 'left' | 'right') => {
    if (isSwipingDisabled || !currentProfile) return;

    const newSwipeCount = swipeCount + 1;
    setSwipeCount(newSwipeCount);

    if (direction === 'right') {
      // Simulate match (50% chance)
      if (Math.random() > 0.5) {
        setMatches(prev => [...prev, currentProfile]);
        setLastMatch(currentProfile);
        setShowMatch(true);
      }
    }

    // Show paywall after 5 swipes
    if (newSwipeCount >= 5) {
      setIsSwipingDisabled(true);
      setShowPayment(true);
      return;
    }

    setCurrentIndex(prev => prev + 1);
  };

  const handlePaymentSuccess = () => {
    setShowPayment(false);
    setIsSwipingDisabled(false);
    setSwipeCount(0);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-purple-900 text-white">
      {/* Header */}
      <div className="flex justify-between items-center p-4 bg-black/20 backdrop-blur-md">
        <div className="flex items-center space-x-2">
          <Heart className="w-6 h-6 text-pink-500" />
          <span className="text-xl font-bold">Connect</span>
        </div>
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="sm" className="text-white hover:bg-white/10">
            <User className="w-5 h-5" />
          </Button>
          <Button variant="ghost" size="sm" className="text-white hover:bg-white/10">
            <Settings className="w-5 h-5" />
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-80px)] p-4">
        {currentProfile && currentIndex < profiles.length ? (
          <div className="relative">
            <ProfileCard 
              profile={currentProfile} 
              onSwipe={handleSwipe}
              disabled={isSwipingDisabled}
            />
            
            {/* Action Buttons */}
            <div className="flex justify-center space-x-8 mt-8">
              <Button
                size="lg"
                variant="outline"
                className="rounded-full w-16 h-16 border-red-500 text-red-500 hover:bg-red-500 hover:text-white transition-colors"
                onClick={() => handleSwipe('left')}
                disabled={isSwipingDisabled}
              >
                <X className="w-8 h-8" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="rounded-full w-16 h-16 border-green-500 text-green-500 hover:bg-green-500 hover:text-white transition-colors"
                onClick={() => handleSwipe('right')}
                disabled={isSwipingDisabled}
              >
                <Heart className="w-8 h-8" />
              </Button>
            </div>

            {/* Paywall Notice */}
            {swipeCount >= 3 && !isSwipingDisabled && (
              <div className="text-center mt-4 p-3 bg-purple-500/20 rounded-lg backdrop-blur-md">
                <p className="text-sm text-purple-200">
                  {5 - swipeCount} swipes remaining before premium required
                </p>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center">
            <Heart className="w-16 h-16 text-pink-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">No more profiles!</h2>
            <p className="text-gray-400">Check back later for more connections</p>
            <Button 
              className="mt-4 bg-purple-600 hover:bg-purple-700"
              onClick={() => {
                setCurrentIndex(0);
                setSwipeCount(0);
                setIsSwipingDisabled(false);
              }}
            >
              Start Over
            </Button>
          </div>
        )}
      </div>

      {/* Match Modal */}
      {showMatch && lastMatch && (
        <MatchModal
          profile={lastMatch}
          onClose={() => setShowMatch(false)}
        />
      )}

      {/* Payment Modal */}
      {showPayment && (
        <PaymentModal
          onSuccess={handlePaymentSuccess}
          onClose={() => setShowPayment(false)}
        />
      )}
    </div>
  );
};

export default Index;
