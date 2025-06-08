import { useState, useEffect, useCallback } from 'react';
import { toast } from '@/hooks/use-toast';

interface ContentItem {
  id: string;
  url: string;
  type: 'image' | 'video';
  colorName: string;
  timestamp: number;
  fileName: string;
}

const COLOR_NAMES = [
  'Coral Red', 'Teal Green', 'Sky Blue', 'Mint Green', 'Vanilla Yellow',
  'Lavender Purple', 'Orange Sunset', 'Ruby Red', 'Amethyst Purple', 'Ocean Blue'
];

// Demo content for the promoter (replacing MEGA integration)
const DEMO_CONTENT = [
  {
    name: 'Demo_Image_1.jpg',
    url: 'https://picsum.photos/400/600?random=1',
    type: 'image' as const,
    timestamp: Date.now()
  },
  {
    name: 'Demo_Video_1.mp4',
    url: 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4',
    type: 'video' as const,
    timestamp: Date.now()
  },
  {
    name: 'Demo_Image_2.jpg',
    url: 'https://picsum.photos/400/600?random=2',
    type: 'image' as const,
    timestamp: Date.now()
  }
];

const MAX_TILES = 6;

export const useContentPromoter = () => {
  const [contentItems, setContentItems] = useState<ContentItem[]>([]);
  const [currentColorIndex, setCurrentColorIndex] = useState(0);
  const [currentFileIndex, setCurrentFileIndex] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Generate content from demo files with tile management
  const generateContentFromDemo = useCallback(() => {
    const selectedFile = DEMO_CONTENT[currentFileIndex];
    const colorName = COLOR_NAMES[currentColorIndex];
    
    const newItem: ContentItem = {
      id: `content-promoter-${Date.now()}`,
      url: selectedFile.url,
      type: selectedFile.type,
      colorName,
      timestamp: Date.now(),
      fileName: selectedFile.name
    };

    setContentItems(prev => {
      // Add new item to the beginning and keep only MAX_TILES (6)
      const updatedItems = [newItem, ...prev].slice(0, MAX_TILES);
      console.log(`Added new content item. Total items: ${updatedItems.length}`);
      return updatedItems;
    });
    
    setCurrentColorIndex(prev => (prev + 1) % COLOR_NAMES.length);
    setCurrentFileIndex(prev => (prev + 1) % DEMO_CONTENT.length);
    
    console.log('Posted new content:', selectedFile.name, 'with color:', colorName);
    toast({
      title: "New content posted",
      description: `Posted ${selectedFile.name}`,
    });
  }, [currentFileIndex, currentColorIndex]);

  // Auto-posting interval management
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isActive) {
      console.log('Starting Content Promoter auto-posting...');
      
      // Post immediately when started
      generateContentFromDemo();
      
      // Then post every 40 seconds
      interval = setInterval(() => {
        console.log('Auto-posting content...');
        generateContentFromDemo();
      }, 40000);
    }

    return () => {
      if (interval) {
        console.log('Clearing auto-posting interval');
        clearInterval(interval);
      }
    };
  }, [isActive, generateContentFromDemo]);

  const startContentPromoter = useCallback(() => {
    console.log('Starting Content Promoter...');
    setIsActive(true);
    setError(null);
    
    toast({
      title: "Content Promoter started",
      description: "Auto-posting demo content every 40 seconds",
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
    console.log('Refreshing demo content...');
    toast({
      title: "Demo content refreshed",
      description: "Ready to post demo content",
    });
  }, []);

  return {
    contentItems,
    isActive,
    startContentPromoter,
    stopContentPromoter,
    availableFiles: DEMO_CONTENT.length,
    error,
    isLoading,
    refreshFiles
  };
};
