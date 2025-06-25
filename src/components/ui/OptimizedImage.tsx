
import React, { useState, useRef, useEffect, memo } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

interface OptimizedImageProps {
  src: string;
  alt: string;
  className?: string;
  fallback?: string;
  loading?: 'lazy' | 'eager';
  onLoad?: () => void;
  onError?: () => void;
  onClick?: (e: React.MouseEvent) => void;
  expandable?: boolean;
  priority?: boolean;
}

const OptimizedImage = memo(({ 
  src, 
  alt, 
  className = '', 
  fallback = 'https://picsum.photos/400/600?random=999',
  loading = 'lazy',
  onLoad,
  onError,
  onClick,
  expandable = false,
  priority = false
}: OptimizedImageProps) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [isInView, setIsInView] = useState(priority);
  const [aspectRatio, setAspectRatio] = useState<string>('auto');
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    if (priority) return; // Skip intersection observer for priority images
    
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1, rootMargin: '50px' }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => observer.disconnect();
  }, [priority]);

  const handleLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const img = e.currentTarget;
    const ratio = img.naturalWidth / img.naturalHeight;
    
    // Smart aspect ratio detection
    if (ratio > 1.5) {
      setAspectRatio('16/9');
    } else if (ratio < 0.8) {
      setAspectRatio('9/16');
    } else {
      setAspectRatio('1/1');
    }
    
    setIsLoading(false);
    onLoad?.();
  };

  const handleError = () => {
    setIsLoading(false);
    setHasError(true);
    onError?.();
  };

  const shouldLoad = priority || isInView;

  return (
    <div 
      className={`relative overflow-hidden ${className} ${expandable || onClick ? 'cursor-pointer' : ''}`} 
      ref={imgRef}
      onClick={onClick}
      style={{ aspectRatio }}
    >
      {isLoading && (
        <Skeleton className="absolute inset-0 bg-gray-700" />
      )}
      
      {shouldLoad && (
        <img
          src={hasError ? fallback : src}
          alt={alt}
          className={`w-full h-full object-contain transition-opacity duration-300 ${
            isLoading ? 'opacity-0' : 'opacity-100'
          } ${expandable || onClick ? 'hover:scale-105 transition-transform duration-200' : ''}`}
          onLoad={handleLoad}
          onError={handleError}
          loading={loading}
          decoding="async"
        />
      )}
    </div>
  );
});

OptimizedImage.displayName = 'OptimizedImage';
export default OptimizedImage;
