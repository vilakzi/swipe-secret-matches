
import React from 'react';
import { Play, Pause, Maximize, Minimize, Volume2, VolumeX } from 'lucide-react';
import { Slider } from '@/components/ui/slider';

interface VideoControlsProps {
  isPlaying: boolean;
  isBuffering: boolean;
  isLoading: boolean;
  isFullscreen: boolean;
  showControls: boolean;
  showPoster: boolean;
  videoError: string | null;
  volume: number;
  isMuted: boolean;
  onPlay: () => void;
  onFullscreen: () => void;
  onVolumeChange: (volume: number) => void;
  onMuteToggle: () => void;
}

const VideoControls: React.FC<VideoControlsProps> = ({
  isPlaying,
  isBuffering,
  isLoading,
  isFullscreen,
  showControls,
  showPoster,
  videoError,
  volume,
  isMuted,
  onPlay,
  onFullscreen,
  onVolumeChange,
  onMuteToggle,
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
            <div className="flex items-center space-x-4">
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
              
              {/* Volume Controls */}
              <div className="flex items-center space-x-2">
                <button
                  onClick={onMuteToggle}
                  className="hover:text-gray-300"
                >
                  {isMuted || volume === 0 ? (
                    <VolumeX className="w-5 h-5" />
                  ) : (
                    <Volume2 className="w-5 h-5" />
                  )}
                </button>
                <div className="w-20">
                  <Slider
                    value={[isMuted ? 0 : volume * 100]}
                    onValueChange={(value) => onVolumeChange(value[0] / 100)}
                    max={100}
                    step={5}
                    className="cursor-pointer"
                  />
                </div>
              </div>
            </div>
            
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
