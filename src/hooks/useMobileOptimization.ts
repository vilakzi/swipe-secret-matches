
import { useState, useEffect, useCallback } from 'react';
import { useIsMobile } from './use-mobile';

interface MobileOptimizationConfig {
  enablePullToRefresh?: boolean;
  enableSwipeGestures?: boolean;
  enableHapticFeedback?: boolean;
  optimizeImages?: boolean;
  lazyLoadThreshold?: number;
}

export const useMobileOptimization = (config: MobileOptimizationConfig = {}) => {
  const isMobile = useIsMobile();
  const [isLowEndDevice, setIsLowEndDevice] = useState(false);
  const [networkSpeed, setNetworkSpeed] = useState<'slow' | 'fast' | 'unknown'>('unknown');
  const [isReducedMotion, setIsReducedMotion] = useState(false);

  // Detect device capabilities
  useEffect(() => {
    // Check for reduced motion preference
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setIsReducedMotion(mediaQuery.matches);

    const handleMotionChange = (e: MediaQueryListEvent) => {
      setIsReducedMotion(e.matches);
    };

    mediaQuery.addEventListener('change', handleMotionChange);

    // Detect low-end device
    const checkDeviceCapabilities = () => {
      // @ts-ignore
      const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
      
      if (connection) {
        const effectiveType = connection.effectiveType;
        setNetworkSpeed(effectiveType === '4g' ? 'fast' : 'slow');
      }

      // Check hardware concurrency (CPU cores)
      const cores = navigator.hardwareConcurrency || 1;
      const memory = (navigator as any).deviceMemory || 1;

      setIsLowEndDevice(cores <= 2 || memory <= 2);
    };

    checkDeviceCapabilities();

    return () => {
      mediaQuery.removeEventListener('change', handleMotionChange);
    };
  }, []);

  // Performance optimization helpers
  const shouldUseAnimation = useCallback(() => {
    return !isReducedMotion && (!isLowEndDevice || !isMobile);
  }, [isReducedMotion, isLowEndDevice, isMobile]);

  const shouldOptimizeImages = useCallback(() => {
    return config.optimizeImages !== false && (isMobile || networkSpeed === 'slow');
  }, [config.optimizeImages, isMobile, networkSpeed]);

  const shouldLazyLoad = useCallback(() => {
    return isMobile || networkSpeed === 'slow';
  }, [isMobile, networkSpeed]);

  const getOptimalImageSize = useCallback((originalSize: { width: number; height: number }) => {
    if (!shouldOptimizeImages()) return originalSize;

    const maxMobileWidth = 800;
    const maxMobileHeight = 600;

    const { width, height } = originalSize;
    const aspectRatio = width / height;

    if (width > maxMobileWidth) {
      return {
        width: maxMobileWidth,
        height: Math.round(maxMobileWidth / aspectRatio)
      };
    }

    if (height > maxMobileHeight) {
      return {
        width: Math.round(maxMobileHeight * aspectRatio),
        height: maxMobileHeight
      };
    }

    return originalSize;
  }, [shouldOptimizeImages]);

  // Touch optimization
  const touchOptimizationConfig = {
    minTouchTarget: 44, // Minimum touch target size in pixels
    tapDelay: isLowEndDevice ? 300 : 150,
    scrollThreshold: 10,
  };

  // Vibration feedback
  const vibrate = useCallback((pattern: number | number[]) => {
    if (config.enableHapticFeedback !== false && 'vibrate' in navigator && isMobile) {
      navigator.vibrate(pattern);
    }
  }, [config.enableHapticFeedback, isMobile]);

  return {
    isMobile,
    isLowEndDevice,
    networkSpeed,
    isReducedMotion,
    shouldUseAnimation,
    shouldOptimizeImages,
    shouldLazyLoad,
    getOptimalImageSize,
    touchOptimizationConfig,
    vibrate,
    config: {
      ...config,
      enablePullToRefresh: config.enablePullToRefresh !== false && isMobile,
      enableSwipeGestures: config.enableSwipeGestures !== false && isMobile,
      enableHapticFeedback: config.enableHapticFeedback !== false && isMobile,
      optimizeImages: shouldOptimizeImages(),
      lazyLoadThreshold: config.lazyLoadThreshold || (isMobile ? 100 : 200),
    }
  };
};
