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

const memoizedVideoControls = useMemo(() => (
  <VideoControls
    isPlaying={isPlaying}
    isBuffering={isBuffering}
    isLoading={isLoading}
    isFullscreen={isFullscreen}
    currentTime={currentTime}
    duration={duration}
    volume={volume}
    isMuted={volume === 0}
    showControls={showControls || !isPlaying}
    showPoster={!isPlaying && currentTime === 0}
    videoError={error}
    onPlay={togglePlay}
    onPlayPause={togglePlay}
    onSeek={handleSeek}
    onVolumeChange={handleVolumeChangeWrapper}
    onMuteToggle={handleToggleMute}
    onFullscreen={toggleFullscreen}
  />
), [
  isPlaying, 
  isBuffering, 
  isLoading, 
  isFullscreen, 
  currentTime, 
  duration, 
  volume, 
  showControls, 
  error, 
  togglePlay, 
  handleSeek, 
  handleVolumeChangeWrapper, 
  handleToggleMute, 
  toggleFullscreen
]);