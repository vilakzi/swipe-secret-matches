
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
    <div className={`absolute inset-0 transition-opacity duration-200 ${showControls ? 'opacity-100' : 'opacity-0'} pointer-events-none`}>
      {/* Background overlay for better visibility */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
      
      {/* Center play/pause button */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="pointer-events-auto">
          <Button
            variant="ghost"
            size="lg"
            onClick={(e) => handleControlClick(e, onPlayClick)}
            className="text-white hover:bg-white/20 bg-black/40 backdrop-blur-sm rounded-full p-4 transition-all duration-200 border border-white/20"
            disabled={isBuffering}
          >
            {isBuffering ? (
              <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : isPlaying ? (
              <Pause className="w-6 h-6" />
            ) : (
              <Play className="w-6 h-6 ml-1" />
            )}
          </Button>
        </div>
      </div>
      
      {/* Bottom controls bar */}
      <div className="absolute bottom-0 left-0 right-0 p-3 pointer-events-none">
        <div className="flex items-center justify-between pointer-events-auto">
          {/* Left controls - Volume */}
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => handleControlClick(e, onToggleMute)}
              className="text-white hover:bg-white/20 bg-black/40 backdrop-blur-sm border border-white/20 p-2"
            >
              {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </Button>
            
            {/* Volume slider */}
            <div className="flex items-center bg-black/40 backdrop-blur-sm rounded-full px-2 py-1 border border-white/20">
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
                className="w-16 h-2 bg-white/30 rounded-lg appearance-none cursor-pointer"
                style={{
                  background: `linear-gradient(to right, #ffffff ${(isMuted ? 0 : volume) * 100}%, #ffffff30 ${(isMuted ? 0 : volume) * 100}%)`
                }}
              />
            </div>
          </div>
          
          {/* Right controls - Fullscreen */}
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => handleControlClick(e, onToggleFullscreen)}
            className="text-white hover:bg-white/20 bg-black/40 backdrop-blur-sm border border-white/20 p-2"
          >
            {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default VideoControlsOverlay;
