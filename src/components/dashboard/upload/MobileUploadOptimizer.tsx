
import React, { useEffect, useState } from 'react';
import { toast } from '@/hooks/use-toast';

interface MobileUploadOptimizerProps {
  file: File | null;
  onOptimizedFile: (file: File) => void;
  onError: (error: string) => void;
}

const MobileUploadOptimizer: React.FC<MobileUploadOptimizerProps> = ({
  file,
  onOptimizedFile,
  onError
}) => {
  const [isOptimizing, setIsOptimizing] = useState(false);

  useEffect(() => {
    if (!file) return;

    const optimizeForMobile = async () => {
      if (!file.type.startsWith('image/')) {
        onOptimizedFile(file);
        return;
      }

      // Only optimize large images on mobile
      const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      const isLargeFile = file.size > 5 * 1024 * 1024; // 5MB

      if (!isMobile || !isLargeFile) {
        onOptimizedFile(file);
        return;
      }

      setIsOptimizing(true);

      try {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const img = new Image();

        img.onload = () => {
          // Calculate optimal dimensions for mobile
          const maxWidth = 1920;
          const maxHeight = 1920;
          let { width, height } = img;

          if (width > maxWidth || height > maxHeight) {
            const ratio = Math.min(maxWidth / width, maxHeight / height);
            width *= ratio;
            height *= ratio;
          }

          canvas.width = width;
          canvas.height = height;
          ctx?.drawImage(img, 0, 0, width, height);

          canvas.toBlob(
            (blob) => {
              if (blob) {
                const optimizedFile = new File([blob], file.name, {
                  type: file.type,
                  lastModified: Date.now(),
                });
                onOptimizedFile(optimizedFile);
                
                if (optimizedFile.size < file.size) {
                  toast({
                    title: "Image optimized for mobile",
                    description: `File size reduced from ${Math.round(file.size / 1024 / 1024)}MB to ${Math.round(optimizedFile.size / 1024 / 1024)}MB`,
                  });
                }
              } else {
                onOptimizedFile(file);
              }
              setIsOptimizing(false);
            },
            file.type,
            0.8 // Compression quality
          );
        };

        img.onerror = () => {
          onError('Failed to optimize image');
          setIsOptimizing(false);
        };

        img.src = URL.createObjectURL(file);
      } catch (error) {
        console.error('Mobile optimization error:', error);
        onOptimizedFile(file); // Fallback to original file
        setIsOptimizing(false);
      }
    };

    optimizeForMobile();
  }, [file, onOptimizedFile, onError]);

  if (isOptimizing) {
    return (
      <div className="flex items-center space-x-2 text-blue-400 text-sm">
        <div className="w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
        <span>Optimizing for mobile...</span>
      </div>
    );
  }

  return null;
};

export default MobileUploadOptimizer;
