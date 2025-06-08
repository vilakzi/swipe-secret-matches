
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

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
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch available files from MEGA
  const fetchMegaFiles = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const { data, error } = await supabase.functions.invoke('mega-content-fetcher');
      
      if (error) {
        console.error('Error fetching MEGA files:', error);
        setError(`Failed to fetch files: ${error.message}`);
        toast({
          title: "Error fetching content",
          description: error.message,
          variant: "destructive",
        });
        return;
      }

      if (data?.files && Array.isArray(data.files)) {
        setAvailableFiles(data.files);
        console.log('Fetched MEGA files:', data.files.length);
        
        if (data.files.length === 0) {
          setError('No files found in MEGA folder');
          toast({
            title: "No content available",
            description: "No files found in the MEGA folder",
            variant: "destructive",
          });
        } else {
          toast({
            title: "Content loaded",
            description: `Found ${data.files.length} files in MEGA folder`,
          });
        }
      } else {
        setError('Invalid response format from MEGA');
        console.error('Invalid response format:', data);
      }
    } catch (error) {
      console.error('Error in fetchMegaFiles:', error);
      setError(`Network error: ${error.message}`);
      toast({
        title: "Network error",
        description: "Failed to connect to content service",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Generate content from MEGA files
  const generateContentFromMega = useCallback(() => {
    if (availableFiles.length === 0) {
      console.log('No MEGA files available for posting');
      setError('No files available for posting');
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
    toast({
      title: "New content posted",
      description: `Posted ${selectedFile.name}`,
    });
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
      toast({
        title: "No content available",
        description: "Please wait for files to load or check MEGA configuration",
        variant: "destructive",
      });
      fetchMegaFiles(); // Try to fetch files if not available
      return;
    }
    setIsActive(true);
    generateContentFromMega(); // Post immediately when started
    toast({
      title: "Content Promoter started",
      description: "Auto-posting content every 40 seconds",
    });
  };

  const stopContentPromoter = () => {
    setIsActive(false);
    toast({
      title: "Content Promoter stopped",
      description: "Auto-posting has been disabled",
    });
  };

  return {
    contentItems,
    isActive,
    startContentPromoter,
    stopContentPromoter,
    availableFiles: availableFiles.length,
    error,
    isLoading,
    refreshFiles: fetchMegaFiles
  };
};
