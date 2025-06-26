
import { useState, useEffect, useCallback } from 'react';

interface SmartVideoControlsConfig {
  hideDelay?: number;
  showOnHover?: boolean;
  showOnTouch?: boolean;
}

export const useSmartVideoControls = ({
  hideDelay = 3000,
  showOnHover = true,
  showOnTouch = true
}: SmartVideoControlsConfig = {}) => {
  const [showControls, setShowControls] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [userInteracting, setUserInteracting] = useState(true);
  const [hideTimeout, setHideTimeout] = useState<NodeJS.Timeout | null>(null);

  const showControlsTemporarily = useCallback(() => {
    setShowControls(true);
    setUserInteracting(true);
    
    if (hideTimeout) {
      clearTimeout(hideTimeout);
    }
    
    if (isPlaying) {
      const timeout = setTimeout(() => {
        setShowControls(false);
        setUserInteracting(false);
      }, hideDelay);
      setHideTimeout(timeout);
    }
  }, [isPlaying, hideDelay, hideTimeout]);

  const handleVideoPlay = useCallback(() => {
    setIsPlaying(true);
    if (!userInteracting) {
      showControlsTemporarily();
    }
  }, [userInteracting, showControlsTemporarily]);

  const handleVideoPause = useCallback(() => {
    setIsPlaying(false);
    setShowControls(true);
    if (hideTimeout) {
      clearTimeout(hideTimeout);
      setHideTimeout(null);
    }
  }, [hideTimeout]);

  const handleMouseMove = useCallback(() => {
    if (showOnHover) {
      showControlsTemporarily();
    }
  }, [showOnHover, showControlsTemporarily]);

  const handleTouchStart = useCallback(() => {
    if (showOnTouch) {
      showControlsTemporarily();
    }
  }, [showOnTouch, showControlsTemporarily]);

  const handleClick = useCallback(() => {
    showControlsTemporarily();
  }, [showControlsTemporarily]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (hideTimeout) {
        clearTimeout(hideTimeout);
      }
    };
  }, [hideTimeout]);

  return {
    showControls,
    handleVideoPlay,
    handleVideoPause,
    handleMouseMove,
    handleTouchStart,
    handleClick,
    isPlaying,
    userInteracting
  };
};
