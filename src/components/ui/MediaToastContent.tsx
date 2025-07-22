
import React from 'react';
import { cn } from '@/lib/utils';

interface MediaToastContentProps {
  title?: string;
  description?: string;
  mediaUrl?: string;
  mediaType?: 'image' | 'video';
  mediaPoster?: string;
  className?: string;
}

const MediaToastContent = ({ 
  title, 
  description, 
  mediaUrl, 
  mediaType = 'image',
  mediaPoster,
  className 
}: MediaToastContentProps) => {
  return (
    <div className={cn("flex items-start space-x-4 w-full", className)}>
      {mediaUrl && (
        <div className="flex-shrink-0">
          {mediaType === 'image' ? (
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-lg overflow-hidden bg-muted">
              <img
                src={mediaUrl}
                alt=""
                className="w-full h-full object-cover"
                loading="lazy"
              />
            </div>
          ) : (
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-lg overflow-hidden bg-muted relative">
              <video
                src={mediaUrl}
                poster={mediaPoster}
                className="w-full h-full object-cover"
                muted
                playsInline
              />
              <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                <div className="w-6 h-6 bg-white/90 rounded-full flex items-center justify-center">
                  <div className="w-0 h-0 border-l-[6px] border-l-black/80 border-y-[4px] border-y-transparent ml-0.5"></div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
      
      <div className="flex-1 min-w-0 space-y-1">
        {title && (
          <div className="text-base sm:text-lg font-semibold leading-tight text-foreground">
            {title}
          </div>
        )}
        {description && (
          <div className="text-sm sm:text-base opacity-90 leading-relaxed text-foreground/80">
            {description}
          </div>
        )}
      </div>
    </div>
  );
};

export default MediaToastContent;
