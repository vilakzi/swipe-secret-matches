
import React, { useState } from 'react';
import { Play } from 'lucide-react';

interface PostVideoPlayerProps {
  src: string;
  posterUrl?: string;
}

const PostVideoPlayer: React.FC<PostVideoPlayerProps> = ({ src, posterUrl }) => {
  const [videoError, setVideoError] = useState<string | null>(null);

  // Debugging: log video src
  if (src) {
    console.log("[PostVideoPlayer] src:", src);
  }

  return (
    <div className="relative">
      <video
        src={src}
        className="w-full h-72 object-cover"
        controls
        poster={posterUrl}
        onError={(e) => {
          setVideoError('Failed to load video (check file integrity and URL).');
          console.error('[PostVideoPlayer] Video failed to load:', src, e);
        }}
        onCanPlay={() => {
          setVideoError(null);
          console.log('[PostVideoPlayer] Video can be played:', src);
        }}
      >
        Sorry, your browser can't play this video.
      </video>
      {videoError && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/60 z-10">
          <span className="text-red-400 font-bold text-center px-4">
            {videoError}<br/>
            <span className="text-xs">({src})</span>
          </span>
        </div>
      )}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <Play className="w-12 h-12 text-white opacity-80" />
      </div>
    </div>
  );
};

export default PostVideoPlayer;
