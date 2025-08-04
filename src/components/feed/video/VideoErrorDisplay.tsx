
import * as React from 'react';

interface VideoErrorDisplayProps {
  videoError: string | null;
  src: string;
}

const VideoErrorDisplay: React.FC<VideoErrorDisplayProps> = ({
  videoError,
  src,
}) => {
  if (!videoError) return null;

  return (
    <div className="absolute inset-0 flex items-center justify-center bg-black/80 z-20">
      <div className="text-center text-white p-4">
        <p className="text-red-400 font-bold mb-2">{videoError}</p>
        <p className="text-xs text-gray-300 break-all">{src}</p>
      </div>
    </div>
  );
};

export default VideoErrorDisplay;
