import { useState } from 'react';

export const useVideoModal = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [videoSrc, setVideoSrc] = useState('');
  const [videoPoster, setVideoPoster] = useState('');

  const openModal = (src: string, poster: string = '') => {
    setVideoSrc(src);
    setVideoPoster(poster);
    setIsOpen(true);
  };

  const closeModal = () => {
    setIsOpen(false);
    setVideoSrc('');
    setVideoPoster('');
  };

  return {
    isOpen,
    videoSrc,
    videoPoster,
    openModal,
    closeModal,
  };
};