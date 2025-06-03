
import { useState } from 'react';

export const useImageModal = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [imageSrc, setImageSrc] = useState('');
  const [imageAlt, setImageAlt] = useState('');

  const openModal = (src: string, alt: string = 'Full size image') => {
    setImageSrc(src);
    setImageAlt(alt);
    setIsOpen(true);
  };

  const closeModal = () => {
    setIsOpen(false);
    setImageSrc('');
    setImageAlt('');
  };

  return {
    isOpen,
    imageSrc,
    imageAlt,
    openModal,
    closeModal,
  };
};
