
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Crown, Heart, MessageCircle, Zap, X, Check, Clock, Users, Shield } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useState } from 'react';
import { toast } from '@/hooks/use-toast';

interface PaywallModalProps {
  isOpen: boolean;
  onClose: () => void;
  trigger: 'interaction' | 'scroll_limit' | 'initial';
  remainingScrolls?: number;
}

const PaywallModal = ({ isOpen, onClose, trigger, remainingScrolls = 0 }: PaywallModalProps) => {
  const { session } = useAuth();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubscribe = async () => {
    if (!session) return;

    setIsProcessing(true);
    try {
      const { data, error } = await supabase.functions.invoke('create-subscription', {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (error) throw error;

      if (data.url) {
        window.location.href = data.url;
      }
    } catch (error) {
      console.error('Error creating subscription:', error);
      toast({
        title: "Error",
        description: "Failed to start subscription process. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const getModalContent = () => {
    switch (trigger) {
      case 'scroll_limit':
        return {
          title: "Daily Limit Reached",
          subtitle: `You've used all 5 free profile views today!`,
          description: "Subscribe to get unlimited access and connect with more people."
        };
      case 'interaction':
        return {
          title: "Premium Feature",
          subtitle: "Unlock interactions with premium subscription",
          description: "Like, message, and connect with unlimited profiles."
        };
      default:
        return {
          title: "Welcome to Premium",
          subtitle: "Get unlimited access for just R99/year",
          description: "Connect with unlimited profiles and unlock all features."
        };
    }
  };

  const content = getModalContent();

  const features = [
    { icon: Heart, text: "Unlimited likes & interactions" },
    { icon: MessageCircle, text: "Send unlimited messages" },
    { icon: Users, text: "View unlimited profiles daily" },
    { icon: Zap, text: "Priority profile visibility" },
    { icon: Shield, text: "Advanced privacy controls" },
    { icon: Crown, text: "Premium member badge" },
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-gradient-to-br from-gray-900 to-purple-900 border-purple-500/20 text-white max-w-md">
        <DialogHeader>
          <div className="flex justify-between items-center">
            <DialogTitle className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
              {content.title}
            </DialogTitle>
            <Button
              variant="ghost"
              size="sm"
              className="text-white hover:bg-white/10"
              onClick={onClose}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
          <p className="text-gray-300 text-sm">{content.subtitle}</p>
        </DialogHeader>

        <div className="space-y-6">
          {/* Usage Counter for scroll limit */}
          {trigger === 'scroll_limit' && (
            <Card className="bg-red-500/20 border-red-500/30 p-4 text-center">
              <div className="text-lg font-semibold text-red-300">
                {remainingScrolls}/5 free views used today
              </div>
              <div className="text-sm text-red-400">
                Resets at midnight
              </div>
            </Card>
          )}

          {/* Features Grid */}
          <div className="grid grid-cols-2 gap-3">
            {features.map((feature, index) => (
              <Card key={index} className="bg-white/5 border-white/10 p-3">
                <div className="flex items-center space-x-2">
                  <feature.icon className="w-5 h-5 text-purple-400" />
                  <span className="text-sm text-white">{feature.text}</span>
                </div>
              </Card>
            ))}
          </div>

          {/* Pricing */}
          <Card className="bg-gradient-to-r from-purple-600 to-pink-600 border-none p-6 text-center">
            <div className="space-y-2">
              <div className="text-3xl font-bold">R99</div>
              <div className="text-sm opacity-90">per year</div>
              <div className="text-xs opacity-75">Just R8.25 per month!</div>
            </div>
          </Card>

          {/* Subscribe Button */}
          <Button
            onClick={handleSubscribe}
            disabled={isProcessing}
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold py-3"
          >
            {isProcessing ? (
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Processing...</span>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Crown className="w-5 h-5" />
                <span>Subscribe for R99/year</span>
              </div>
            )}
          </Button>

          {/* Value Proposition */}
          <div className="text-center space-y-2">
            <div className="flex items-center justify-center space-x-2 text-green-400">
              <Check className="w-4 h-4" />
              <span className="text-sm">Cancel anytime</span>
            </div>
            <p className="text-xs text-gray-400">
              {content.description}
            </p>
          </div>

          {/* Free tier reminder */}
          {trigger !== 'scroll_limit' && (
            <Card className="bg-gray-800/50 border-gray-600 p-3">
              <div className="text-xs text-gray-400 text-center">
                Free users get 5 profile views per day
              </div>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PaywallModal;
