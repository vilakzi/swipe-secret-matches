
import { useState, useEffect, useCallback } from 'react';

interface ContentItem {
  id: string;
  url: string;
  type: 'image' | 'video';
  colorName: string;
}

const COLORS = [
  '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7',
  '#DDA0DD', '#F39C12', '#E74C3C', '#9B59B6', '#3498DB'
];

const COLOR_NAMES = [
  'Coral Red', 'Teal Green', 'Sky Blue', 'Mint Green', 'Vanilla Yellow',
  'Lavender Purple', 'Orange Sunset', 'Ruby Red', 'Amethyst Purple', 'Ocean Blue'
];

export const useContentPromoter = () => {
  const [contentItems, setContentItems] = useState<ContentItem[]>([]);
  const [currentColorIndex, setCurrentColorIndex] = useState(0);
  const [isActive, setIsActive] = useState(false);

  const generateRandomContent = useCallback(() => {
    // Simulate fetching from MEGA account
    const mockContent = [
      { url: 'https://picsum.photos/400/600?random=1', type: 'image' as const },
      { url: 'https://picsum.photos/400/600?random=2', type: 'image' as const },
      { url: 'https://picsum.photos/400/600?random=3', type: 'image' as const },
      // Add mock video URLs when available
    ];

    const randomIndex = Math.floor(Math.random() * mockContent.length);
    const selectedContent = mockContent[randomIndex];
    
    const colorName = COLOR_NAMES[currentColorIndex];
    
    const newItem: ContentItem = {
      id: `content-promoter-${Date.now()}`,
      url: selectedContent.url,
      type: selectedContent.type,
      colorName
    };

    setContentItems(prev => [newItem, ...prev.slice(0, 9)]); // Keep last 10 items
    setCurrentColorIndex(prev => (prev + 1) % COLOR_NAMES.length);
  }, [currentColorIndex]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isActive) {
      // Post new content every 40 seconds
      interval = setInterval(() => {
        generateRandomContent();
      }, 40000);
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [isActive, generateRandomContent]);

  const startContentPromoter = () => {
    setIsActive(true);
    generateRandomContent(); // Post immediately when started
  };

  const stopContentPromoter = () => {
    setIsActive(false);
  };

  return {
    contentItems,
    isActive,
    startContentPromoter,
    stopContentPromoter
  };
};
