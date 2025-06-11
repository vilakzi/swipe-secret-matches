
import { useState, useCallback } from 'react';
import { toast } from '@/hooks/use-toast';

interface ContentItem {
  id: string;
  url: string;
  type: 'image' | 'video';
  colorName: string;
  timestamp: number;
  fileName: string;
}

const MAX_TILES = 6;

export const useContentPromoter = () => {
  const [contentItems, setContentItems] = useState<ContentItem[]>([]);
  const [isActive, setIsActive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const startContentPromoter = useCallback(() => {
    console.log('Content Promoter requires real content to be configured');
    setError('No content source configured');
    
    toast({
      title: "Content Promoter not configured",
      description: "Please configure a content source first",
      variant: "destructive",
    });
  }, []);

  const stopContentPromoter = useCallback(() => {
    console.log('Stopping Content Promoter...');
    setIsActive(false);
    
    toast({
      title: "Content Promoter stopped",
      description: "Auto-posting has been disabled",
    });
  }, []);

  const refreshFiles = useCallback(() => {
    console.log('No content source configured to refresh');
    toast({
      title: "No content source",
      description: "Please configure a content source first",
      variant: "destructive",
    });
  }, []);

  return {
    contentItems,
    isActive,
    startContentPromoter,
    stopContentPromoter,
    availableFiles: 0,
    error,
    isLoading,
    refreshFiles
  };
};
