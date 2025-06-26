
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
  if (!showVideo) return null;

  const handleControlClick = (e: React.MouseEvent, action: () => void) => {
    e.preventDefault();
    e.stopPropagation();
    action();
  };

  return (
    <div className={`absolute inset-0 transition-opacity duration-300 ${showControls ? 'opacity-100' : 'opacity-0 hover:opacity-100'}`}>
      {/* Background overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
      
      {/* Center play/pause button */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="pointer-events-auto">
          <Button
            variant="ghost"
            size="lg"
            onClick={(e) => handleControlClick(e, onPlayClick)}
            className="text-white hover:bg-white/20 bg-black/50 backdrop-blur-sm rounded-full p-6 transition-all duration-200 border border-white/20"
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
      </div>
      
      {/* Bottom controls bar */}
      <div className="absolute bottom-0 left-0 right-0 p-4 pointer-events-none">
        <div className="flex items-center justify-between pointer-events-auto">
          {/* Left controls */}
          <div className="flex items-center space-x-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => handleControlClick(e, onToggleMute)}
              className="text-white hover:bg-white/20 bg-black/30 backdrop-blur-sm border border-white/10"
            >
              {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
            </Button>
            
            {/* Volume slider */}
            <div className="flex items-center space-x-2 bg-black/30 backdrop-blur-sm rounded-full px-3 py-1 border border-white/10">
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={isMuted ? 0 : volume}
                onChange={(e) => {
                  e.stopPropagation();
                  onVolumeChange(parseFloat(e.target.value));
                }}
                className="w-20 h-2 bg-white/20 rounded-lg appearance-none cursor-pointer slider-thumb"
                style={{
                  background: `linear-gradient(to right, #ffffff ${(isMuted ? 0 : volume) * 100}%, #ffffff40 ${(isMuted ? 0 : volume) * 100}%)`
                }}
              />
            </div>
          </div>
          
          {/* Right controls */}
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => handleControlClick(e, onToggleFullscreen)}
            className="text-white hover:bg-white/20 bg-black/30 backdrop-blur-sm border border-white/10"
          >
            {isFullscreen ? <Minimize className="w-5 h-5" /> : <Maximize className="w-5 h-5" />}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default VideoControlsOverlay;
