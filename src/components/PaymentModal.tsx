
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Crown, Heart, MessageCircle, Zap, X, Check, Clock } from 'lucide-react';

interface PaymentModalProps {
  onSuccess: () => void;
  onClose: () => void;
  promotionType?: 'paid_8h' | 'paid_12h';
}

const PaymentModal = ({ onSuccess, onClose, promotionType = 'paid_8h' }: PaymentModalProps) => {
  const [isOpen, setIsOpen] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleClose = () => {
    setIsOpen(false);
    setTimeout(onClose, 300);
  };

  const handlePayment = async () => {
    setIsProcessing(true);
    
    // Simulate PayFast payment process
    // In a real implementation, you would integrate with PayFast API
    try {
      // Simulate payment processing delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Simulate successful payment
      onSuccess();
      handleClose();
    } catch (error) {
      console.error('Payment failed:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const getPromotionDetails = () => {
    if (promotionType === 'paid_12h') {
      return {
        price: 'R39',
        duration: '12 hours',
        features: [
          { icon: Clock, text: "12 hour promotion" },
          { icon: Crown, text: "Premium visibility" },
          { icon: Zap, text: "External platform reach" },
          { icon: Heart, text: "Priority positioning" },
        ]
      };
    }
    
    return {
      price: 'R20',
      duration: '8 hours',
      features: [
        { icon: Clock, text: "8 hour promotion" },
        { icon: Crown, text: "Enhanced visibility" },
        { icon: Zap, text: "Platform promotion" },
        { icon: Heart, text: "Boosted engagement" },
      ]
    };
  };

  const { price, duration, features } = getPromotionDetails();

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="bg-gradient-to-br from-gray-900 to-purple-900 border-purple-500/20 text-white max-w-md">
        <DialogHeader>
          <div className="flex justify-between items-center">
            <DialogTitle className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
              Promote Your Post
            </DialogTitle>
            <Button
              variant="ghost"
              size="sm"
              className="text-white hover:bg-white/10"
              onClick={handleClose}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Features */}
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
              <div className="text-3xl font-bold">{price}</div>
              <div className="text-sm opacity-90">Promote for {duration}</div>
              <div className="text-xs opacity-75">Secure payment via PayFast</div>
            </div>
          </Card>

          {/* Payment Button */}
          <Button
            onClick={handlePayment}
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
                <span>Pay {price} - Promote for {duration}</span>
              </div>
            )}
          </Button>

          {/* Security Notice */}
          <div className="text-center space-y-2">
            <div className="flex items-center justify-center space-x-2 text-green-400">
              <Check className="w-4 h-4" />
              <span className="text-sm">Secure PayFast Payment</span>
            </div>
            <p className="text-xs text-gray-400">
              Your payment is processed securely through PayFast's encrypted payment gateway
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PaymentModal;
