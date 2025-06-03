
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogClose,
} from '@/components/ui/dialog';
import { X } from 'lucide-react';

interface ImageModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageSrc: string;
  imageAlt: string;
}

const ImageModal = ({ isOpen, onClose, imageSrc, imageAlt }: ImageModalProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl w-full h-[90vh] bg-black/95 border-gray-700 p-2">
        <div className="relative w-full h-full flex items-center justify-center">
          <img
            src={imageSrc}
            alt={imageAlt}
            className="max-w-full max-h-full object-contain"
          />
          <DialogClose className="absolute top-4 right-4 bg-black/50 hover:bg-black/70 text-white rounded-full p-2 transition-colors">
            <X className="w-5 h-5" />
          </DialogClose>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ImageModal;
