
import React, { useState, useCallback } from 'react';
import { Card } from '@/components/ui/card';
import { useSwipeGestures } from '@/hooks/useSwipeGestures';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, X, Star } from 'lucide-react';
import TouchFeedbackButton from './TouchFeedbackButton';

interface MobileSwipeCardProps {
  profile: {
    id: string;
    name: string;
    age: number;
    image: string;
    bio?: string;
    location?: string;
  };
  onLike: () => void;
  onPass: () => void;
  onSuperLike: () => void;
  onProfileClick: () => void;
}

const MobileSwipeCard: React.FC<MobileSwipeCardProps> = ({
  profile,
  onLike,
  onPass,
  onSuperLike,
  onProfileClick,
}) => {
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [swipeDirection, setSwipeDirection] = useState<'like' | 'pass' | 'super' | null>(null);

  const handleSwipeLeft = useCallback(() => {
    setSwipeDirection('pass');
    setTimeout(onPass, 300);
  }, [onPass]);

  const handleSwipeRight = useCallback(() => {
    setSwipeDirection('like');
    setTimeout(onLike, 300);
  }, [onLike]);

  const handleSwipeUp = useCallback(() => {
    setSwipeDirection('super');
    setTimeout(onSuperLike, 300);
  }, [onSuperLike]);

  const swipeGestures = useSwipeGestures({
    onSwipeLeft: handleSwipeLeft,
    onSwipeRight: handleSwipeRight,
    onSwipeUp: handleSwipeUp,
    threshold: 80,
    preventDefaultTouchmoveEvent: false
  });

  const getSwipeColor = () => {
    if (!isDragging) return 'transparent';
    if (dragOffset.x > 50) return 'rgba(34, 197, 94, 0.2)'; // Green for like
    if (dragOffset.x < -50) return 'rgba(239, 68, 68, 0.2)'; // Red for pass
    if (dragOffset.y < -50) return 'rgba(59, 130, 246, 0.2)'; // Blue for super like
    return 'transparent';
  };

  const getRotation = () => {
    return dragOffset.x * 0.1; // Slight rotation based on horizontal drag
  };

  return (
    <AnimatePresence>
      <motion.div
        className="relative w-full max-w-sm mx-auto"
        initial={{ scale: 1, rotate: 0 }}
        animate={
          swipeDirection
            ? {
                x: swipeDirection === 'like' ? 300 : swipeDirection === 'pass' ? -300 : 0,
                y: swipeDirection === 'super' ? -300 : 0,
                opacity: 0,
                scale: 0.8,
              }
            : { x: 0, y: 0, opacity: 1, scale: 1 }
        }
        exit={{ opacity: 0, scale: 0.5 }}
        transition={{ duration: 0.3 }}
        drag
        dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
        onDragStart={() => setIsDragging(true)}
        onDragEnd={() => setIsDragging(false)}
        onDrag={(_, info) => {
          setDragOffset({ x: info.offset.x, y: info.offset.y });
        }}
        style={{
          rotate: getRotation(),
          backgroundColor: getSwipeColor(),
        }}
        {...swipeGestures}
      >
        <Card className="overflow-hidden bg-gray-800 border-gray-700 touch-manipulation">
          {/* Profile Image */}
          <div className="relative h-96 overflow-hidden" onClick={onProfileClick}>
            <img
              src={profile.image}
              alt={profile.name}
              className="w-full h-full object-cover"
              loading="lazy"
            />
            
            {/* Swipe Indicators */}
            {isDragging && (
              <div className="absolute inset-0 flex items-center justify-center">
                {dragOffset.x > 50 && (
                  <div className="bg-green-500 text-white p-4 rounded-full">
                    <Heart className="w-8 h-8" />
                  </div>
                )}
                {dragOffset.x < -50 && (
                  <div className="bg-red-500 text-white p-4 rounded-full">
                    <X className="w-8 h-8" />
                  </div>
                )}
                {dragOffset.y < -50 && (
                  <div className="bg-blue-500 text-white p-4 rounded-full">
                    <Star className="w-8 h-8" />
                  </div>
                )}
              </div>
            )}

            {/* Profile Info Overlay */}
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
              <h3 className="text-white text-xl font-bold">
                {profile.name}, {profile.age}
              </h3>
              {profile.location && (
                <p className="text-gray-300 text-sm">{profile.location}</p>
              )}
              {profile.bio && (
                <p className="text-gray-300 text-sm mt-1 line-clamp-2">{profile.bio}</p>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="p-4 flex justify-around items-center bg-gray-800">
            <TouchFeedbackButton
              onClick={onPass}
              variant="outline"
              size="lg"
              className="bg-red-500/20 hover:bg-red-500/30 border-red-500 text-red-400 w-16 h-16 rounded-full"
            >
              <X className="w-6 h-6" />
            </TouchFeedbackButton>

            <TouchFeedbackButton
              onClick={onSuperLike}
              variant="outline"
              size="lg"
              className="bg-blue-500/20 hover:bg-blue-500/30 border-blue-500 text-blue-400 w-14 h-14 rounded-full"
            >
              <Star className="w-5 h-5" />
            </TouchFeedbackButton>

            <TouchFeedbackButton
              onClick={onLike}
              variant="outline"
              size="lg"
              className="bg-green-500/20 hover:bg-green-500/30 border-green-500 text-green-400 w-16 h-16 rounded-full"
            >
              <Heart className="w-6 h-6" />
            </TouchFeedbackButton>
          </div>
        </Card>
      </motion.div>
    </AnimatePresence>
  );
};

export default MobileSwipeCard;
