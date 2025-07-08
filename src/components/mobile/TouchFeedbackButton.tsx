
import React, { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface TouchFeedbackButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  disabled?: boolean;
  hapticFeedback?: boolean;
}

const TouchFeedbackButton: React.FC<TouchFeedbackButtonProps> = ({
  children,
  onClick,
  className = '',
  variant = 'default',
  size = 'default',
  disabled = false,
  hapticFeedback = true,
}) => {
  const [isPressed, setIsPressed] = useState(false);

  const handleTouchStart = useCallback(() => {
    if (disabled) return;
    setIsPressed(true);
    
    // Add haptic feedback for mobile devices
    if (hapticFeedback && 'vibrate' in navigator) {
      navigator.vibrate(10); // Short vibration
    }
  }, [disabled, hapticFeedback]);

  const handleTouchEnd = useCallback(() => {
    setIsPressed(false);
  }, []);

  const handleClick = useCallback(() => {
    if (disabled) return;
    onClick?.();
  }, [onClick, disabled]);

  return (
    <Button
      variant={variant}
      size={size}
      disabled={disabled}
      onClick={handleClick}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onMouseDown={handleTouchStart}
      onMouseUp={handleTouchEnd}
      onMouseLeave={handleTouchEnd}
      className={cn(
        'touch-manipulation select-none transition-all duration-150',
        'active:scale-95 active:brightness-90',
        isPressed && 'scale-95 brightness-90',
        className
      )}
      style={{
        transform: isPressed ? 'scale(0.95)' : 'scale(1)',
        transition: 'transform 0.1s ease-out'
      }}
    >
      {children}
    </Button>
  );
};

export default TouchFeedbackButton;
