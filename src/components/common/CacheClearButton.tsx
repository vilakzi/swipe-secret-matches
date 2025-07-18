
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Trash2, RotateCcw } from 'lucide-react';
import { clearAppCache, clearUserData } from '@/utils/cacheManager';
import { toast } from '@/hooks/use-toast';

interface CacheClearButtonProps {
  variant?: 'full' | 'user-only';
  size?: 'sm' | 'default' | 'lg';
  className?: string;
}

const CacheClearButton: React.FC<CacheClearButtonProps> = ({
  variant = 'full',
  size = 'default',
  className = ''
}) => {
  const [isClearing, setIsClearing] = useState(false);

  const handleClearCache = async () => {
    setIsClearing(true);
    
    try {
      if (variant === 'full') {
        const success = await clearAppCache();
        if (success) {
          toast({
            title: "Cache Cleared",
            description: "All app data has been cleared. The page will reload.",
          });
          // Reload the page after a short delay
          setTimeout(() => {
            window.location.reload();
          }, 1000);
        } else {
          toast({
            title: "Cache Clear Failed",
            description: "Some cache data could not be cleared.",
            variant: "destructive",
          });
        }
      } else {
        clearUserData();
        toast({
          title: "User Data Cleared",
          description: "User-specific data has been cleared.",
        });
      }
    } catch (error) {
      console.error('Cache clear error:', error);
      toast({
        title: "Error",
        description: "Failed to clear cache data.",
        variant: "destructive",
      });
    } finally {
      setIsClearing(false);
    }
  };

  return (
    <Button
      onClick={handleClearCache}
      disabled={isClearing}
      size={size}
      variant="outline"
      className={`${className}`}
    >
      {isClearing ? (
        <RotateCcw className="w-4 h-4 mr-2 animate-spin" />
      ) : (
        <Trash2 className="w-4 h-4 mr-2" />
      )}
      {isClearing ? 'Clearing...' : variant === 'full' ? 'Clear All Cache' : 'Clear User Data'}
    </Button>
  );
};

export default CacheClearButton;
