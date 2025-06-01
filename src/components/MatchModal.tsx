
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Heart, MessageCircle, X } from 'lucide-react';

interface MatchModalProps {
  isOpen: boolean;
  onClose: () => void;
  matchedProfile: any;
  onSendMessage: () => void;
}

const MatchModal = ({ isOpen, onClose, matchedProfile, onSendMessage }: MatchModalProps) => {
  if (!matchedProfile) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-gradient-to-br from-pink-500 via-purple-500 to-purple-600 border-0">
        <div className="text-center text-white">
          <button
            onClick={onClose}
            className="absolute right-4 top-4 text-white/80 hover:text-white"
          >
            <X className="w-6 h-6" />
          </button>
          
          <div className="mb-6">
            <Heart className="w-16 h-16 text-white mx-auto mb-4 animate-pulse" />
            <h2 className="text-3xl font-bold mb-2">It's a Match!</h2>
            <p className="text-white/90">You and {matchedProfile.display_name} liked each other</p>
          </div>

          <div className="flex justify-center mb-6">
            <div className="relative">
              <div className="w-20 h-20 rounded-full overflow-hidden border-4 border-white/30 mr-4">
                <img
                  src={matchedProfile.profile_image_url || '/placeholder.svg'}
                  alt="Your profile"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="w-20 h-20 rounded-full overflow-hidden border-4 border-white/30">
                <img
                  src={matchedProfile.profile_image_url || '/placeholder.svg'}
                  alt={matchedProfile.display_name}
                  className="w-full h-full object-cover"
                />
              </div>
              <Heart className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-8 h-8 text-white animate-bounce" />
            </div>
          </div>

          <div className="space-y-3">
            <Button
              onClick={onSendMessage}
              className="w-full bg-white text-purple-600 hover:bg-white/90 font-semibold"
            >
              <MessageCircle className="w-4 h-4 mr-2" />
              Send Message
            </Button>
            <Button
              onClick={onClose}
              variant="outline"
              className="w-full border-white/30 text-white hover:bg-white/10"
            >
              Keep Swiping
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default MatchModal;
