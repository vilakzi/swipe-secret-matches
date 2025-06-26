
import React from 'react';
import { Play } from 'lucide-react';

interface SimpleVideoPreviewProps {
  src: string;
  poster?: string;
  onPlay: () => void;
  className?: string;
}

const SimpleVideoPreview: React.FC<SimpleVideoPreviewProps> = ({
  src,
  poster,
  onPlay,
  className = ''
}) => {
  return (
    <div 
      className={`relative bg-gray-900 overflow-hidden cursor-pointer h-72 ${className}`}
      onClick={onPlay}
    >
      {poster ? (
        <img
          src={poster}
          alt="Video preview"
          className="w-full h-full object-cover"
          loading="lazy"
          onError={(e) => {
            // Hide poster if it fails to load
            e.currentTarget.style.display = 'none';
          }}
        />
      ) : (
        <div className="w-full h-full bg-gray-800 flex items-center justify-center">
          <div className="text-gray-400 text-center">
            <Play className="w-12 h-12 mx-auto mb-2" />
            <div className="text-sm">Video</div>
          </div>
        </div>
      )}
      
      {/* Play button overlay */}
      <div className="absolute inset-0 bg-black/20 flex items-center justify-center hover:bg-black/30 transition-colors">
        <div className="bg-black/60 rounded-full p-4 hover:bg-black/80 transition-colors">
          <Play className="w-8 h-8 text-white ml-1" />
        </div>
      </div>
      
      {/* Video indicator */}
      <div className="absolute bottom-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded">
        Video
      </div>
    </div>
  );
};

export default SimpleVideoPreview;
