import * as React from 'react';
import {
  Dialog,
  DialogContent,
  DialogClose,
} from '@/components/ui/dialog';
import { X, Maximize, Minimize } from 'lucide-react';
import ImprovedVideoPlayer from '@/components/feed/video/ImprovedVideoPlayer';

interface VideoModalProps {
  isOpen: boolean;
  onClose: () => void;
  videoSrc: string;
  videoPoster?: string;
}

const VideoModal = ({ isOpen, onClose, videoSrc, videoPoster }: VideoModalProps) => {
  const [isFullscreen, setIsFullscreen] = React.useState(false);
  const containerRef = React.useRef<HTMLDivElement>(null);

  const handleFullscreen = async () => {
    if (!containerRef.current) return;

    try {
      if (!isFullscreen) {
        if (containerRef.current.requestFullscreen) {
          await containerRef.current.requestFullscreen();
        }
      } else {
        if (document.exitFullscreen) {
          await document.exitFullscreen();
        }
      }
    } catch (error) {
      // Fullscreen operation failed
    }
  };

  React.useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent 
        ref={containerRef}
        className={`${
          isFullscreen 
            ? 'w-screen h-screen max-w-none max-h-none p-0' 
            : 'max-w-[95vw] max-h-[95vh] w-auto h-auto p-2'
        } bg-black border-none flex items-center justify-center`}
      >
        <div className="relative w-full h-full flex items-center justify-center">
          <ImprovedVideoPlayer
            src={videoSrc}
            poster={videoPoster}
            className={`${
              isFullscreen 
                ? 'w-full h-full max-w-full max-h-full' 
                : 'w-full h-full max-w-[90vw] max-h-[90vh]'
            } object-contain`}
            autoPlay={true}
            controls={true}
            loop={true}
            muted={false}
            playsInline={true}
          />
          
          <div className="absolute top-4 right-4 flex space-x-2 z-10">
            <button
              onClick={handleFullscreen}
              className="bg-black/50 hover:bg-black/70 text-white rounded-full p-2 transition-colors"
            >
              {isFullscreen ? (
                <Minimize className="w-5 h-5" />
              ) : (
                <Maximize className="w-5 h-5" />
              )}
            </button>
            
            <DialogClose className="bg-black/50 hover:bg-black/70 text-white rounded-full p-2 transition-colors">
              <X className="w-5 h-5" />
            </DialogClose>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default VideoModal;