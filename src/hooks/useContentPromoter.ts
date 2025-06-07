
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface ContentItem {
  id: string;
  url: string;
  type: 'image' | 'video';
  colorName: string;
}

interface MegaFile {
  name: string;
  url: string;
  type: 'image' | 'video';
  timestamp: number;
}

const COLOR_NAMES = [
  'Coral Red', 'Teal Green', 'Sky Blue', 'Mint Green', 'Vanilla Yellow',
  'Lavender Purple', 'Orange Sunset', 'Ruby Red', 'Amethyst Purple', 'Ocean Blue'
];

export const useContentPromoter = () => {
  const [contentItems, setContentItems] = useState<ContentItem[]>([]);
  const [currentColorIndex, setCurrentColorIndex] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [availableFiles, setAvailableFiles] = useState<MegaFile[]>([]);
  const [currentFileIndex, setCurrentFileIndex] = useState(0);

  // Fetch available files from MEGA
  const fetchMegaFiles = useCallback(async () => {
    try {
      const { data, error } = await supabase.functions.invoke('mega-content-fetcher');
      
      if (error) {
        console.error('Error fetching MEGA files:', error);
        return;
      }

      if (data?.files) {
        setAvailableFiles(data.files);
        console.log('Fetched MEGA files:', data.files.length);
      }
    } catch (error) {
      console.error('Error in fetchMegaFiles:', error);
    }
  }, []);

  // Generate content from MEGA files
  const generateContentFromMega = useCallback(() => {
    if (availableFiles.length === 0) {
      console.log('No MEGA files available');
      return;
    }

    const selectedFile = availableFiles[currentFileIndex];
    const colorName = COLOR_NAMES[currentColorIndex];
    
    const newItem: ContentItem = {
      id: `content-promoter-${Date.now()}`,
      url: selectedFile.url,
      type: selectedFile.type,
      colorName
    };

    setContentItems(prev => [newItem, ...prev.slice(0, 9)]); // Keep last 10 items
    setCurrentColorIndex(prev => (prev + 1) % COLOR_NAMES.length);
    setCurrentFileIndex(prev => (prev + 1) % availableFiles.length);
    
    console.log('Posted new content:', selectedFile.name, 'with color:', colorName);
  }, [availableFiles, currentFileIndex, currentColorIndex]);

  // Initialize MEGA files on mount
  useEffect(() => {
    fetchMegaFiles();
  }, [fetchMegaFiles]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isActive && availableFiles.length > 0) {
      // Post new content every 40 seconds
      interval = setInterval(() => {
        generateContentFromMega();
      }, 40000);
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [isActive, generateContentFromMega, availableFiles.length]);

  const startContentPromoter = () => {
    if (availableFiles.length === 0) {
      fetchMegaFiles(); // Try to fetch files if not available
    }
    setIsActive(true);
    generateContentFromMega(); // Post immediately when started
  };

  const stopContentPromoter = () => {
    setIsActive(false);
  };

  return {
    contentItems,
    isActive,
    startContentPromoter,
    stopContentPromoter,
    availableFiles: availableFiles.length
  };
};
