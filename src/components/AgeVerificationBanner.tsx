
import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertTriangle, X } from 'lucide-react';

const AgeVerificationBanner = () => {
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    const hasAccepted = localStorage.getItem('age-verification-accepted');
    if (!hasAccepted) {
      setShowBanner(true);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem('age-verification-accepted', 'true');
    setShowBanner(false);
  };

  const handleDecline = () => {
    window.location.href = 'https://google.com';
  };

  if (!showBanner) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <Card className="bg-gray-900 border-red-500 border-2 max-w-md w-full p-6 relative">
        <div className="flex items-center space-x-3 mb-4">
          <AlertTriangle className="w-8 h-8 text-red-500" />
          <h2 className="text-xl font-bold text-white">Adult Content Warning</h2>
        </div>
        
        <div className="space-y-4 text-gray-300">
          <p className="text-sm">
            This website contains adult content and is intended for users who are 18 years of age or older.
          </p>
          
          <div className="bg-red-900/30 border border-red-500 rounded-lg p-3">
            <p className="text-red-300 text-xs font-medium">
              ⚠️ WARNING: This platform may contain explicit content, adult services, and mature themes.
            </p>
          </div>
          
          <p className="text-sm">
            By continuing, you confirm that:
          </p>
          
          <ul className="text-xs space-y-1 text-gray-400">
            <li>• You are at least 18 years old</li>
            <li>• You understand this site contains adult content</li>
            <li>• Viewing such content is legal in your jurisdiction</li>
            <li>• You consent to viewing adult material</li>
          </ul>
        </div>

        <div className="flex space-x-3 mt-6">
          <Button
            onClick={handleAccept}
            className="flex-1 bg-green-600 hover:bg-green-700 text-white"
          >
            I am 18+ and Accept
          </Button>
          <Button
            onClick={handleDecline}
            variant="outline"
            className="flex-1 border-red-500 text-red-400 hover:bg-red-900/20"
          >
            Leave Site
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default AgeVerificationBanner;
