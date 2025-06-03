
import React, { useState, useRef, useEffect } from 'react';
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
}

const OptimizedImage = ({ 
  src, 
  alt, 
  className = '', 
  fallback = 'https://picsum.photos/400/600?random=999',
  loading = 'lazy',
  onLoad,
  onError,
  onClick,
  expandable = false
}: OptimizedImageProps) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const handleLoad = () => {
    setIsLoading(false);
    onLoad?.();
  };

  const handleError = () => {
    setIsLoading(false);
    setHasError(true);
    onError?.();
  };

  const handleClick = (e: React.MouseEvent) => {
    onClick?.(e);
  };

  const shouldLoad = loading === 'eager' || isInView;

  return (
    <div 
      className={`relative overflow-hidden ${className} ${expandable || onClick ? 'cursor-pointer' : ''}`} 
      ref={imgRef}
      onClick={handleClick}
    >
      {isLoading && (
        <Skeleton className="absolute inset-0 bg-gray-700" />
      )}
      
      {shouldLoad && (
        <img
          src={hasError ? fallback : src}
          alt={alt}
          className={`w-full h-full object-cover transition-opacity duration-300 ${
            isLoading ? 'opacity-0' : 'opacity-100'
          } ${expandable || onClick ? 'hover:scale-105 transition-transform duration-200' : ''}`}
          onLoad={handleLoad}
          onError={handleError}
          loading={loading}
        />
      )}
    </div>
  );
};

export default OptimizedImage;
