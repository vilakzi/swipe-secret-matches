
import React, { useState, useRef } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Heart, X, Star, MapPin, Clock, Zap } from 'lucide-react';
import { motion, useMotionValue, useTransform, PanInfo } from 'framer-motion';

interface SwipeCardProps {
  profile: {
    id: string;
    display_name: string;
    bio: string;
    age: number;
    location: string;
    interests: string[];
    profile_image_url: string;
    profile_images: string[];
    gender: string;
    last_active: string;
    user_type: 'user' | 'service_provider';
    compatibility_score?: number;
  };
  onSwipe: (liked: boolean) => void;
  remainingSwipes: number;
}

const EnhancedSwipeCard = ({ profile, onSwipe, remainingSwipes }: SwipeCardProps) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotate = useTransform(x, [-200, 200], [-25, 25]);
  const opacity = useTransform(x, [-200, -100, 0, 100, 200], [0, 1, 1, 1, 0]);

  const images = profile.profile_images?.length > 0 ? profile.profile_images : [profile.profile_image_url];
  
  const handleDragEnd = (event: any, info: PanInfo) => {
    const swipeThreshold = 100;
    
    if (Math.abs(info.offset.x) > swipeThreshold) {
      const liked = info.offset.x > 0;
      onSwipe(liked);
    } else {
      // Snap back to original position
      x.set(0);
      y.set(0);
    }
  };

  const handleLike = () => {
    x.set(200);
    setTimeout(() => onSwipe(true), 150);
  };

  const handlePass = () => {
    x.set(-200);
    setTimeout(() => onSwipe(false), 150);
  };

  const getLastActiveText = (lastActive: string) => {
    const now = new Date();
    const lastActiveDate = new Date(lastActive);
    const diffInHours = Math.floor((now.getTime() - lastActiveDate.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Active now';
    if (diffInHours < 24) return `Active ${diffInHours}h ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `Active ${diffInDays}d ago`;
    return 'Active over a week ago';
  };

  const nextImage = () => {
    if (images.length > 1) {
      setCurrentImageIndex((prev) => (prev + 1) % images.length);
    }
  };

  const prevImage = () => {
    if (images.length > 1) {
      setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
    }
  };

  return (
    <div className="relative w-full max-w-sm mx-auto">
      {/* Swipe indicators */}
      <motion.div 
        className="absolute top-4 left-4 z-20 bg-green-500 text-white px-3 py-1 rounded-full font-bold"
        style={{ opacity: useTransform(x, [0, 100], [0, 1]) }}
      >
        LIKE
      </motion.div>
      
      <motion.div 
        className="absolute top-4 right-4 z-20 bg-red-500 text-white px-3 py-1 rounded-full font-bold"
        style={{ opacity: useTransform(x, [-100, 0], [1, 0]) }}
      >
        PASS
      </motion.div>

      <motion.div
        ref={cardRef}
        className="relative w-full h-[600px] cursor-grab active:cursor-grabbing"
        style={{ x, y, rotate, opacity }}
        drag
        dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
        onDragEnd={handleDragEnd}
        whileTap={{ scale: 0.95 }}
      >
        <Card className="relative w-full h-full overflow-hidden bg-gradient-to-b from-transparent to-black/60 border-2 border-gray-200 shadow-2xl">
          {/* Image Container */}
          <div className="relative w-full h-full">
            <img
              src={images[currentImageIndex] || '/placeholder.svg'}
              alt={profile.display_name}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.currentTarget.src = '/placeholder.svg';
              }}
            />
            
            {/* Image navigation */}
            {images.length > 1 && (
              <>
                <button
                  onClick={prevImage}
                  className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-black/50 rounded-full flex items-center justify-center text-white hover:bg-black/70 transition-colors"
                >
                  ‹
                </button>
                <button
                  onClick={nextImage}
                  className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-black/50 rounded-full flex items-center justify-center text-white hover:bg-black/70 transition-colors"
                >
                  ›
                </button>
                
                {/* Image dots */}
                <div className="absolute top-4 left-1/2 -translate-x-1/2 flex space-x-1">
                  {images.map((_, index) => (
                    <div
                      key={index}
                      className={`w-2 h-2 rounded-full ${
                        index === currentImageIndex ? 'bg-white' : 'bg-white/50'
                      }`}
                    />
                  ))}
                </div>
              </>
            )}

            {/* Profile Info Overlay */}
            <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
              <div className="space-y-3">
                {/* Name and Age */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <h2 className="text-2xl font-bold">{profile.display_name}</h2>
                    <span className="text-xl">{profile.age}</span>
                    {profile.user_type === 'service_provider' && (
                      <Badge className="bg-purple-600 text-white">
                        <Zap className="w-3 h-3 mr-1" />
                        Pro
                      </Badge>
                    )}
                  </div>
                  
                  {profile.compatibility_score && profile.compatibility_score > 0 && (
                    <Badge className="bg-pink-600 text-white">
                      <Heart className="w-3 h-3 mr-1" />
                      {profile.compatibility_score}% Match
                    </Badge>
                  )}
                </div>

                {/* Location and Activity */}
                <div className="flex items-center space-x-4 text-sm text-white/80">
                  {profile.location && (
                    <div className="flex items-center">
                      <MapPin className="w-4 h-4 mr-1" />
                      {profile.location}
                    </div>
                  )}
                  <div className="flex items-center">
                    <Clock className="w-4 h-4 mr-1" />
                    {getLastActiveText(profile.last_active)}
                  </div>
                </div>

                {/* Bio */}
                {profile.bio && (
                  <p className="text-sm text-white/90 line-clamp-2">{profile.bio}</p>
                )}

                {/* Interests */}
                {profile.interests && profile.interests.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {profile.interests.slice(0, 4).map((interest, index) => (
                      <Badge key={index} variant="secondary" className="text-xs bg-white/20 text-white border-white/30">
                        {interest}
                      </Badge>
                    ))}
                    {profile.interests.length > 4 && (
                      <Badge variant="secondary" className="text-xs bg-white/20 text-white border-white/30">
                        +{profile.interests.length - 4} more
                      </Badge>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Action Buttons */}
      <div className="flex justify-center space-x-6 mt-6">
        <Button
          onClick={handlePass}
          size="lg"
          className="w-14 h-14 rounded-full bg-white border-2 border-gray-300 hover:border-red-400 hover:bg-red-50 shadow-lg"
          disabled={remainingSwipes <= 0}
        >
          <X className="w-6 h-6 text-gray-600" />
        </Button>
        
        <Button
          onClick={handleLike}
          size="lg"
          className="w-16 h-16 rounded-full bg-gradient-to-r from-pink-500 to-red-500 hover:from-pink-600 hover:to-red-600 shadow-lg"
          disabled={remainingSwipes <= 0}
        >
          <Heart className="w-7 h-7 text-white" />
        </Button>
      </div>

      {/* Remaining swipes indicator */}
      <div className="text-center mt-4">
        <p className="text-sm text-gray-600">
          {remainingSwipes} swipes remaining today
        </p>
      </div>
    </div>
  );
};

export default EnhancedSwipeCard;
