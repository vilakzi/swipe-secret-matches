
import React from 'react';

interface VideoLoadingIndicatorProps {
  isLoading: boolean;
  isBuffering: boolean;
  showPoster: boolean;
}

const VideoLoadingIndicator: React.FC<VideoLoadingIndicatorProps> = ({
  isLoading,
  isBuffering,
  showPoster,
}) => {
  if ((!isLoading && !isBuffering) || showPoster) return null;

  return (
    <div className="absolute inset-0 flex items-center justify-center bg-black/60 z-10">
      <div className="w-12 h-12 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
    </div>
  );
};

export default VideoLoadingIndicator;
