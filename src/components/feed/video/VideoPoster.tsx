
import React from 'react';
import { Play } from 'lucide-react';

interface VideoPosterProps {
  posterUrl: string;
  isFullscreen: boolean;
  showPoster: boolean;
  onVideoClick: () => void;
  onPosterLoad: () => void;
}

const VideoPoster: React.FC<VideoPosterProps> = ({
  posterUrl,
  isFullscreen,
  showPoster,
  onVideoClick,
  onPosterLoad,
}) => {
  if (!showPoster) return null;

  return (
    <div 
      className="absolute inset-0 cursor-pointer z-10"
      onClick={onVideoClick}
    >
      <img
        src={posterUrl}
        alt="Video cover"
        className={`w-full h-full object-cover ${
          isFullscreen ? 'object-contain' : 'object-cover'
        }`}
        onLoad={onPosterLoad}
        onError={(e) => {
          console.log('Poster failed to load, using fallback');
          e.currentTarget.src = `https://images.unsplash.com/photo-1605810230434-7631ac76ec81?w=400&h=600&fit=crop&crop=center`;
        }}
      />
      {/* Play button overlay */}
      <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
        <div className="bg-black/60 rounded-full p-4 hover:bg-black/80 transition-colors">
          <Play className="w-12 h-12 text-white ml-1" />
        </div>
      </div>
      {/* Video duration or info overlay if available */}
      <div className="absolute bottom-4 right-4 bg-black/60 text-white text-sm px-2 py-1 rounded">
        Video
      </div>
    </div>
  );
};

export default VideoPoster;
