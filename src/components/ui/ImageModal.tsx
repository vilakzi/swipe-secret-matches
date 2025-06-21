
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogClose,
} from '@/components/ui/dialog';
import { X, Maximize, Minimize } from 'lucide-react';

interface ImageModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageSrc: string;
  imageAlt: string;
}

const ImageModal = ({ isOpen, onClose, imageSrc, imageAlt }: ImageModalProps) => {
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
      console.error('Fullscreen error:', error);
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
        className={`max-w-[95vw] w-full ${isFullscreen ? 'h-screen max-h-screen' : 'h-[90vh] max-h-[90vh]'} bg-black/95 border-gray-700 p-2`}
      >
        <div className="relative w-full h-full flex items-center justify-center">
          <img
            src={imageSrc}
            alt={imageAlt}
            className="max-w-full max-h-full object-contain"
          />
          
          <div className="absolute top-4 right-4 flex space-x-2">
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

export default ImageModal;
