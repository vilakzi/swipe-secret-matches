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