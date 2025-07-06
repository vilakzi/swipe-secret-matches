
import { useEffect, useRef, useCallback } from 'react';

interface UseVideoAutoPlayOptions {
  threshold?: number;
  rootMargin?: string;
  onVideoStart?: () => void;
  onVideoStop?: () => void;
}

export const useVideoAutoPlay = (
  videoRef: React.RefObject<HTMLVideoElement>,
  options: UseVideoAutoPlayOptions = {}
) => {
  const {
    threshold = 0.5,
    rootMargin = '0px',
    onVideoStart,
    onVideoStop
  } = options;
  
  const observerRef = useRef<IntersectionObserver | null>(null);
  const isInViewRef = useRef(false);

  const handleIntersection = useCallback((entries: IntersectionObserverEntry[]) => {
    const [entry] = entries;
    const video = videoRef.current;
    
    if (!video) return;

    if (entry.isIntersecting && !isInViewRef.current) {
      isInViewRef.current = true;
      
      // Pause all other videos first
      const allVideos = document.querySelectorAll('video');
      allVideos.forEach(v => {
        if (v !== video && !v.paused) {
          v.pause();
        }
      });
      
      // Play this video
      video.muted = true; // Auto-play requires muted
      video.play().catch(console.error);
      
      // Notify that video viewing started
      onVideoStart?.();
      
    } else if (!entry.isIntersecting && isInViewRef.current) {
      isInViewRef.current = false;
      video.pause();
      
      // Notify that video viewing stopped
      onVideoStop?.();
    }
  }, [videoRef, onVideoStart, onVideoStop]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    observerRef.current = new IntersectionObserver(handleIntersection, {
      threshold,
      rootMargin
    });

    observerRef.current.observe(video);

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
      // Clean up video viewing state
      onVideoStop?.();
    };
  }, [handleIntersection, threshold, rootMargin, onVideoStop]);

  return { isInView: isInViewRef.current };
};
