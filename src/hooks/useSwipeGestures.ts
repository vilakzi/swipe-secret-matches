
import { useState, useCallback, useRef } from 'react';

interface SwipeGestureOptions {
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onSwipeUp?: () => void;
  onSwipeDown?: () => void;
  threshold?: number;
  preventDefaultTouchmoveEvent?: boolean;
}

export const useSwipeGestures = ({
  onSwipeLeft,
  onSwipeRight,
  onSwipeUp,
  onSwipeDown,
  threshold = 50,
  preventDefaultTouchmoveEvent = false
}: SwipeGestureOptions) => {
  const [touchStart, setTouchStart] = useState<{ x: number; y: number } | null>(null);
  const [touchEnd, setTouchEnd] = useState<{ x: number; y: number } | null>(null);
  const [isSwiping, setIsSwiping] = useState(false);
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);

  const onTouchStart = useCallback((e: React.TouchEvent) => {
    const touch = e.targetTouches[0];
    const startPoint = { x: touch.clientX, y: touch.clientY };
    setTouchEnd(null);
    setTouchStart(startPoint);
    touchStartRef.current = startPoint;
    setIsSwiping(false);
  }, []);

  const onTouchMove = useCallback((e: React.TouchEvent) => {
    if (preventDefaultTouchmoveEvent) {
      e.preventDefault();
    }
    
    if (!touchStartRef.current) return;
    
    const touch = e.targetTouches[0];
    const currentPoint = { x: touch.clientX, y: touch.clientY };
    
    const deltaX = Math.abs(currentPoint.x - touchStartRef.current.x);
    const deltaY = Math.abs(currentPoint.y - touchStartRef.current.y);
    
    if (deltaX > threshold || deltaY > threshold) {
      setIsSwiping(true);
    }
  }, [threshold, preventDefaultTouchmoveEvent]);

  const onTouchEnd = useCallback((e: React.TouchEvent) => {
    if (!touchStart) return;
    
    const touch = e.changedTouches[0];
    const endPoint = { x: touch.clientX, y: touch.clientY };
    setTouchEnd(endPoint);

    const deltaX = touchStart.x - endPoint.x;
    const deltaY = touchStart.y - endPoint.y;
    const isLeftSwipe = deltaX > threshold;
    const isRightSwipe = deltaX < -threshold;
    const isUpSwipe = deltaY > threshold;
    const isDownSwipe = deltaY < -threshold;

    if (isLeftSwipe && onSwipeLeft) {
      onSwipeLeft();
    } else if (isRightSwipe && onSwipeRight) {
      onSwipeRight();
    } else if (isUpSwipe && onSwipeUp) {
      onSwipeUp();
    } else if (isDownSwipe && onSwipeDown) {
      onSwipeDown();
    }

    setTouchStart(null);
    setTouchEnd(null);
    setIsSwiping(false);
    touchStartRef.current = null;
  }, [touchStart, threshold, onSwipeLeft, onSwipeRight, onSwipeUp, onSwipeDown]);

  return {
    onTouchStart,
    onTouchMove,
    onTouchEnd,
    isSwiping,
    touchStart,
    touchEnd
  };
};
