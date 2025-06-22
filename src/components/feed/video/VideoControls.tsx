
import React from 'react';
import { Play, Pause, Maximize, Minimize } from 'lucide-react';

interface VideoControlsProps {
  isPlaying: boolean;
  isBuffering: boolean;
  isLoading: boolean;
  isFullscreen: boolean;
  showControls: boolean;
  showPoster: boolean;
  videoError: string | null;
  onPlay: () => void;
  onFullscreen: () => void;
}

const VideoControls: React.FC<VideoControlsProps> = ({
  isPlaying,
  isBuffering,
  isLoading,
  isFullscreen,
  showControls,
  showPoster,
  videoError,
  onPlay,
  onFullscreen,
}) => {
  return (
    <>
      {/* Play/Pause controls when video is visible */}
      {showControls && !videoError && !isLoading && !showPoster && (
        <div className="absolute inset-0 flex items-center justify-center">
          <button
            onClick={onPlay}
            className="bg-black/50 rounded-full p-4 hover:bg-black/70 transition-colors"
            disabled={isBuffering}
          >
            {isPlaying ? (
              <Pause className="w-12 h-12 text-white" />
            ) : (
              <Play className="w-12 h-12 text-white ml-1" />
            )}
          </button>
        </div>
      )}
      
      {/* Bottom controls overlay when video is playing */}
      {!showPoster && (
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4">
          <div className="flex items-center justify-between text-white">
            <button
              onClick={onPlay}
              className="flex items-center space-x-2 hover:text-gray-300"
              disabled={isBuffering || isLoading}
            >
              {isPlaying ? (
                <Pause className="w-5 h-5" />
              ) : (
                <Play className="w-5 h-5" />
              )}
              <span className="text-sm">
                {isBuffering ? 'Buffering...' : isPlaying ? 'Pause' : 'Play'}
              </span>
            </button>
            
            <button
              onClick={onFullscreen}
              className="flex items-center space-x-2 hover:text-gray-300"
            >
              {isFullscreen ? (
                <Minimize className="w-5 h-5" />
              ) : (
                <Maximize className="w-5 h-5" />
              )}
              <span className="text-sm">{isFullscreen ? 'Exit' : 'Fullscreen'}</span>
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default VideoControls;
