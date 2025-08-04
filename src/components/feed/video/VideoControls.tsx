import * as React from 'react';
import { Play, Pause, Volume2, VolumeX } from 'lucide-react';

interface VideoControlsProps {
  showControls: boolean;
  isPlaying: boolean;
  isBuffering: boolean;
  isLoading: boolean;
  isMuted: boolean;
  volume: number;
  currentTime: number;
  duration: number;
  onTogglePlay: (e: React.MouseEvent) => void;
  onToggleMute: (e: React.MouseEvent) => void;
  onVolumeChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSeek: (e: React.MouseEvent<HTMLDivElement>) => void;
}

const formatTime = (seconds: number): string => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
};

const VideoControls: React.FC<VideoControlsProps> = ({
  showControls,
  isPlaying,
  isBuffering,
  isLoading,
  isMuted,
  volume,
  currentTime,
  duration,
  onTogglePlay,
  onToggleMute,
  onVolumeChange,
  onSeek,
}) => {
  return (
    <div className={`absolute inset-0 pointer-events-none transition-opacity duration-300 ${showControls ? 'opacity-100' : 'opacity-0'} z-20`}>
      {/* Top Controls */}
      <div className="absolute top-4 right-4 flex items-center space-x-2 pointer-events-auto">
        <button
          onClick={onToggleMute}
          className="bg-black/60 hover:bg-black/80 text-white p-2 rounded-full transition-colors"
        >
          {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
        </button>
      </div>

      {/* Bottom Controls */}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 pointer-events-auto">
        {/* Progress Bar */}
        <div 
          className="w-full h-2 bg-white/30 rounded-full mb-3 cursor-pointer hover:h-3 transition-all"
          onClick={onSeek}
        >
          <div 
            className="h-full bg-white rounded-full transition-all duration-200"
            style={{ width: `${duration > 0 ? (currentTime / duration) * 100 : 0}%` }}
          />
        </div>

        <div className="flex items-center justify-between">
          {/* Play/Pause and Time */}
          <div className="flex items-center space-x-3">
            <button
              onClick={onTogglePlay}
              className="bg-black/60 hover:bg-black/80 text-white p-2 rounded-full transition-colors"
            >
              {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
            </button>
            
            <div className="text-white text-sm">
              {formatTime(currentTime)} / {formatTime(duration)}
            </div>
          </div>

          {/* Volume Control */}
          <div className="flex items-center space-x-2">
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={isMuted ? 0 : volume}
              onChange={onVolumeChange}
              className="w-20 h-1 bg-white/30 rounded-lg appearance-none cursor-pointer slider"
              style={{
                background: `linear-gradient(to right, #ffffff ${(isMuted ? 0 : volume) * 100}%, #ffffff30 ${(isMuted ? 0 : volume) * 100}%)`
              }}
            />
          </div>
        </div>
      </div>

      {/* Center Play/Pause Button - only show when paused */}
      {!isPlaying && !isBuffering && !isLoading && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-auto">
          <button
            onClick={onTogglePlay}
            className="bg-black/60 hover:bg-black/80 text-white p-4 rounded-full transition-colors"
          >
            <Play className="w-8 h-8 ml-1" />
          </button>
        </div>
      )}

      <style jsx>{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          width: 16px;
          height: 16px;
          border-radius: 50%;
          background: #ffffff;
          cursor: pointer;
          border: 2px solid #000;
        }
        
        .slider::-moz-range-thumb {
          width: 16px;
          height: 16px;
          border-radius: 50%;
          background: #ffffff;
          cursor: pointer;
          border: 2px solid #000;
        }
      `}</style>
    </div>
  );
};

export default VideoControls;