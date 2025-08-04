
import * as React from 'react';
import { Play, AlertCircle, RotateCcw } from 'lucide-react';
import { useVideoThumbnail } from '@/hooks/useVideoThumbnail';
import { Button } from '@/components/ui/button';

interface EnhancedVideoPreviewProps {
  src: string;
  poster?: string;
  onPlay: () => void;
  className?: string;
  duration?: number;
}

const EnhancedVideoPreview: React.FC<EnhancedVideoPreviewProps> = ({
  src,
  poster,
  onPlay,
  className = '',
  duration
}) => {
  const {
    thumbnail,
    isGenerating,
    error,
    metadata,
    regenerateThumbnail
  } = useVideoThumbnail(src, {
    width: 400,
    height: 300,
    timeOffset: 1,
    quality: 0.8
  });

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const displayDuration = duration || metadata?.duration;
  const displayThumbnail = poster || thumbnail;

  return (
    <div 
      className={`relative bg-gray-900 overflow-hidden cursor-pointer h-72 ${className}`}
      onClick={onPlay}
    >
      {/* Loading state */}
      {isGenerating && !displayThumbnail && (
        <div className="absolute inset-0 bg-gray-800 flex items-center justify-center">
          <div className="text-center text-gray-400">
            <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
            <div className="text-sm">Generating preview...</div>
          </div>
        </div>
      )}

      {/* Error state with retry */}
      {error && !displayThumbnail && (
        <div className="absolute inset-0 bg-gray-800 flex items-center justify-center">
          <div className="text-center text-gray-400 p-4">
            <AlertCircle className="w-8 h-8 mx-auto mb-2 text-red-400" />
            <div className="text-sm mb-3">Preview unavailable</div>
            <Button
              variant="outline"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                regenerateThumbnail();
              }}
              className="text-xs"
            >
              <RotateCcw className="w-3 h-3 mr-1" />
              Retry
            </Button>
          </div>
        </div>
      )}

      {/* Thumbnail display */}
      {displayThumbnail && (
        <img
          src={displayThumbnail}
          alt="Video preview"
          className="w-full h-full object-cover"
          loading="lazy"
          onError={(e) => {
            console.log('Thumbnail failed to load, hiding...');
            e.currentTarget.style.display = 'none';
          }}
        />
      )}

      {/* Fallback for no thumbnail */}
      {!displayThumbnail && !isGenerating && !error && (
        <div className="w-full h-full bg-gray-800 flex items-center justify-center">
          <div className="text-gray-400 text-center">
            <Play className="w-12 h-12 mx-auto mb-2" />
            <div className="text-sm">Video Content</div>
          </div>
        </div>
      )}
      
      {/* Play button overlay */}
      <div className="absolute inset-0 bg-black/20 flex items-center justify-center hover:bg-black/30 transition-colors">
        <div className="bg-black/60 rounded-full p-4 hover:bg-black/80 transition-colors">
          <Play className="w-8 h-8 text-white ml-1" />
        </div>
      </div>
      
      {/* Video duration indicator */}
      {displayDuration && (
        <div className="absolute bottom-2 left-2 bg-black/80 text-white text-xs px-2 py-1 rounded">
          {formatDuration(displayDuration)}
        </div>
      )}

      {/* Video indicator */}
      <div className="absolute bottom-2 right-2 bg-black/80 text-white text-xs px-2 py-1 rounded">
        Video
      </div>

      {/* Quality indicator for generated thumbnails */}
      {thumbnail && !poster && (
        <div className="absolute top-2 left-2 bg-purple-600/80 text-white text-xs px-2 py-1 rounded">
          Auto Preview
        </div>
      )}
    </div>
  );
};

export default EnhancedVideoPreview;
