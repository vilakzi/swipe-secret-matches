
import React from 'react';
import { Play, Pause, Volume2, VolumeX, Maximize, Minimize } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface VideoControlsOverlayProps {
  showControls: boolean;
  showVideo: boolean;
  isPlaying: boolean;
  isBuffering: boolean;
  isMuted: boolean;
  volume: number;
  isFullscreen: boolean;
  onPlayClick: () => void;
  onToggleMute: () => void;
  onVolumeChange: (value: number) => void;
  onToggleFullscreen: () => void;
}

const VideoControlsOverlay: React.FC<VideoControlsOverlayProps> = ({
  showControls,
  showVideo,
  isPlaying,
  isBuffering,
  isMuted,
  volume,
  isFullscreen,
  onPlayClick,
  onToggleMute,
  onVolumeChange,
  onToggleFullscreen
}) => {
  if (!showControls || !showVideo) return null;

  return (
    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent transition-opacity duration-300">
      {/* Center play/pause button */}
      <div className="absolute inset-0 flex items-center justify-center">
        <Button
          variant="ghost"
          size="lg"
          onClick={onPlayClick}
          className="text-white hover:bg-white/20 bg-black/30 rounded-full p-4 transition-all duration-200"
          disabled={isBuffering}
        >
          {isBuffering ? (
            <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : isPlaying ? (
            <Pause className="w-8 h-8" />
          ) : (
            <Play className="w-8 h-8 ml-1" />
          )}
        </Button>
      </div>
      
      {/* Bottom controls */}
      <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggleMute}
            className="text-white hover:bg-white/20"
          >
            {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
          </Button>
          
          {/* Volume control */}
          <div className="flex items-center space-x-2">
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={isMuted ? 0 : volume}
              onChange={(e) => onVolumeChange(parseFloat(e.target.value))}
              className="w-16 h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer"
            />
          </div>
        </div>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={onToggleFullscreen}
          className="text-white hover:bg-white/20"
        >
          {isFullscreen ? <Minimize className="w-5 h-5" /> : <Maximize className="w-5 h-5" />}
        </Button>
      </div>
    </div>
  );
};

export default VideoControlsOverlay;
