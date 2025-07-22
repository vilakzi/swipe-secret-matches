
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { X, Download, Smartphone } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

const PWAInstallPrompt = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Check if app is already installed
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
    const isInWebApp = (window.navigator as any).standalone === true;
    setIsInstalled(isStandalone || isInWebApp);

    // Listen for beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      
      // Show prompt after a delay if not dismissed before
      setTimeout(() => {
        const dismissed = localStorage.getItem('pwa-install-dismissed');
        if (!dismissed && !isInstalled) {
          setShowPrompt(true);
        }
      }, 30000); // Show after 30 seconds
    };

    // Listen for app installation
    const handleAppInstalled = () => {
      console.log('PWA was installed');
      setIsInstalled(true);
      setShowPrompt(false);
      localStorage.removeItem('pwa-install-dismissed');
      toast({
        title: "App Installed!",
        description: "Connect is now available on your home screen",
      });
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, [isInstalled]);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    try {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      
      if (outcome === 'accepted') {
        console.log('User accepted the install prompt');
      } else {
        console.log('User dismissed the install prompt');
      }
      
      setDeferredPrompt(null);
      setShowPrompt(false);
    } catch (error) {
      console.error('Error during PWA installation:', error);
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    localStorage.setItem('pwa-install-dismissed', 'true');
  };

  if (isInstalled || !showPrompt || !deferredPrompt) {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 max-w-sm mx-auto">
      <Card className="bg-gray-900/95 backdrop-blur-md border-gray-700 shadow-2xl">
        <CardContent className="p-4">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center space-x-2">
              <Smartphone className="w-5 h-5 text-purple-400" />
              <h3 className="font-semibold text-white">Install Connect</h3>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDismiss}
              className="text-gray-400 hover:text-white p-1 h-auto"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
          
          <p className="text-sm text-gray-300 mb-4">
            Install Connect for a better experience with offline access and instant notifications.
          </p>
          
          <div className="flex space-x-2">
            <Button
              onClick={handleInstallClick}
              className="flex-1 bg-purple-600 hover:bg-purple-700"
              size="sm"
            >
              <Download className="w-4 h-4 mr-2" />
              Install
            </Button>
            <Button
              variant="outline"
              onClick={handleDismiss}
              className="border-gray-600 text-gray-300 hover:bg-gray-800"
              size="sm"
            >
              Later
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PWAInstallPrompt;
