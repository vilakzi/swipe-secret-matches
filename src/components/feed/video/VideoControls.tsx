
import React from 'react';
import { Play, Pause, Volume2, VolumeX, Maximize, Minimize } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface VideoControlsProps {
  isPlaying: boolean;
  isBuffering: boolean;
  isLoading: boolean;
  isFullscreen: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  isMuted: boolean;
  showControls: boolean;
  showPoster: boolean;
  videoError: Error | null;
  onPlay: () => void;
  onPlayPause: () => void;
  onSeek: (time: number) => void;
  onVolumeChange: (volume: number) => void;
  onMuteToggle: () => void;
  onFullscreen: () => void;
}

const VideoControls: React.FC<VideoControlsProps> = ({
  isPlaying,
  isBuffering,
  isFullscreen,
  currentTime,
  duration,
  volume,
  isMuted,
  showControls,
  onPlayPause,
  onSeek,
  onVolumeChange,
  onMuteToggle,
  onFullscreen,
}) => {
  if (!showControls) return null;

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none">
      {/* Center play button */}
      <div className="absolute inset-0 flex items-center justify-center">
        <Button
          className="pointer-events-auto bg-black/60 hover:bg-black/80 text-white border-white/20 rounded-full p-4"
          onClick={onPlayPause}
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

      {/* Bottom controls */}
      <div className="absolute bottom-4 left-4 right-4 pointer-events-none">
        <div className="flex items-center justify-between pointer-events-auto">
          {/* Time display */}
          <div className="text-white text-sm bg-black/40 px-2 py-1 rounded">
            {formatTime(currentTime)} / {formatTime(duration)}
          </div>

          {/* Right controls */}
          <div className="flex items-center space-x-2">
            <Button
              size="sm"
              className="bg-black/40 hover:bg-black/60 text-white border-white/20"
              onClick={onMuteToggle}
            >
              {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </Button>
            
            <Button
              size="sm"
              className="bg-black/40 hover:bg-black/60 text-white border-white/20"
              onClick={onFullscreen}
            >
              {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
            </Button>
          </div>
        </div>

        {/* Progress bar */}
        <div className="mt-2 pointer-events-auto">
          <input
            type="range"
            min="0"
            max={duration || 0}
            value={currentTime}
            onChange={(e) => onSeek(Number(e.target.value))}
            className="w-full h-1 bg-white/30 rounded-lg appearance-none cursor-pointer"
            style={{
              background: `linear-gradient(to right, #ffffff ${(currentTime / (duration || 1)) * 100}%, #ffffff30 ${(currentTime / (duration || 1)) * 100}%)`
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default VideoControls;
