
import { useState } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Heart, MessageCircle, X } from 'lucide-react';

interface Profile {
  id: number;
  name: string;
  age: number;
  image: string;
  bio: string;
  whatsapp: string;
  location: string;
}

interface MatchModalProps {
  profile: Profile;
  onClose: () => void;
}

const MatchModal = ({ profile, onClose }: MatchModalProps) => {
  const [isOpen, setIsOpen] = useState(true);

  const handleClose = () => {
    setIsOpen(false);
    setTimeout(onClose, 300);
  };

  const handleWhatsAppClick = () => {
    const message = encodeURIComponent(`Hi ${profile.name}! We matched and I'd love to get to know you better.`);
    window.open(`https://wa.me/${profile.whatsapp.replace('+', '')}?text=${message}`, '_blank');
    handleClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="bg-gradient-to-br from-pink-900 to-purple-900 border-pink-500/20 text-white max-w-md">
        <div className="text-center space-y-6 p-4">
          {/* Close Button */}
          <Button
            variant="ghost"
            size="sm"
            className="absolute top-4 right-4 text-white hover:bg-white/10"
            onClick={handleClose}
          >
            <X className="w-4 h-4" />
          </Button>

          {/* Match Animation */}
          <div className="relative">
            <div className="w-32 h-32 mx-auto rounded-full bg-gradient-to-r from-pink-500 to-purple-500 p-1 animate-pulse">
              <div
                className="w-full h-full rounded-full bg-cover bg-center"
                style={{ backgroundImage: `url(${profile.image})` }}
              />
            </div>
            <div className="absolute -top-2 -right-2">
              <Heart className="w-8 h-8 text-pink-400 animate-bounce" />
            </div>
          </div>

          {/* Match Text */}
          <div>
            <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-purple-400 mb-2">
              It's a Match!
            </h2>
            <p className="text-lg text-white/90">
              You and <span className="font-semibold text-pink-300">{profile.name}</span> liked each other
            </p>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <Button
              onClick={handleWhatsAppClick}
              className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3"
            >
              <MessageCircle className="w-5 h-5 mr-2" />
              Message on WhatsApp
            </Button>
            
            <Button
              variant="outline"
              onClick={handleClose}
              className="w-full border-white/20 text-white hover:bg-white/10"
            >
              Keep Swiping
            </Button>
          </div>

          {/* Confetti Effect */}
          <div className="absolute inset-0 pointer-events-none">
            {Array.from({ length: 20 }).map((_, i) => (
              <div
                key={i}
                className="absolute w-2 h-2 bg-pink-400 rounded-full animate-ping"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 2}s`,
                  animationDuration: `${1 + Math.random()}s`,
                }}
              />
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default MatchModal;
