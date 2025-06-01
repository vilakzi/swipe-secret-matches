
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Crown, Heart, MessageCircle, Zap, X } from 'lucide-react';

interface PaywallModalProps {
  isOpen: boolean;
  onClose: () => void;
  feature: 'super_likes' | 'unlimited_swipes' | 'premium_features';
  onUpgrade: () => void;
}

const PaywallModal = ({ isOpen, onClose, feature, onUpgrade }: PaywallModalProps) => {
  const getFeatureDetails = () => {
    switch (feature) {
      case 'super_likes':
        return {
          icon: <Heart className="w-12 h-12 text-yellow-500" />,
          title: 'Out of Super Likes',
          description: 'Get unlimited super likes and stand out from the crowd',
          benefits: ['Unlimited super likes', '5x more matches', 'Priority in discovery']
        };
      case 'unlimited_swipes':
        return {
          icon: <Zap className="w-12 h-12 text-blue-500" />,
          title: 'Daily Limit Reached',
          description: 'Upgrade to premium for unlimited swipes',
          benefits: ['Unlimited daily swipes', 'See who liked you', 'Advanced filters']
        };
      case 'premium_features':
        return {
          icon: <Crown className="w-12 h-12 text-purple-500" />,
          title: 'Premium Feature',
          description: 'Unlock all premium features for the best experience',
          benefits: ['All premium features', 'Ad-free experience', 'Priority support']
        };
    }
  };

  const details = getFeatureDetails();

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-gray-900 border-gray-700">
        <DialogHeader>
          <button
            onClick={onClose}
            className="absolute right-4 top-4 text-gray-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="text-center">
            <div className="flex justify-center mb-4">
              {details.icon}
            </div>
            <DialogTitle className="text-white text-xl mb-2">
              {details.title}
            </DialogTitle>
            <p className="text-gray-400 text-sm">
              {details.description}
            </p>
          </div>
        </DialogHeader>

        <div className="space-y-4">
          <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
            <h4 className="text-white font-medium mb-3">Premium Benefits:</h4>
            <ul className="space-y-2">
              {details.benefits.map((benefit, index) => (
                <li key={index} className="flex items-center text-gray-300 text-sm">
                  <Crown className="w-4 h-4 text-yellow-500 mr-2 flex-shrink-0" />
                  {benefit}
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-3">
            <Button
              onClick={onUpgrade}
              className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold"
            >
              <Crown className="w-4 h-4 mr-2" />
              Upgrade to Premium
            </Button>
            <Button
              onClick={onClose}
              variant="outline"
              className="w-full border-gray-600 text-gray-300 hover:bg-gray-800"
            >
              Maybe Later
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PaywallModal;
