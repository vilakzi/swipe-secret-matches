
import ImprovedVideoPlayer from './video/ImprovedVideoPlayer';
import { isVideo } from '@/utils/feed/mediaUtils';

interface PostVideoPlayerProps {
  src: string;
  poster?: string;
  className?: string;
}

const PostVideoPlayer = ({ src, poster, className = '' }: PostVideoPlayerProps) => {
  // Validate video source
  if (!src || src.trim() === '' || !isVideo(src)) {
    return (
      <div className={`bg-gray-800 flex items-center justify-center h-96 ${className}`}>
        <div className="text-center text-gray-400">
          <div className="text-sm">No video available</div>
        </div>
      </div>
    );
  }

  return (
    <ImprovedVideoPlayer
      src={src}
      poster={poster}
      className={`${className} min-h-96`} // Ensure proper sizing
      autoPlay={true} // Enable autoplay for feed videos
      controls={true} // Enable smart controls
    />
  );
};

export default PostVideoPlayer;
