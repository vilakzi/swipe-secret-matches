
import React from 'react';

interface PostCardCaptionProps {
  name: string;
  caption: string;
  onProfileClick: () => void;
}

const PostCardCaption = ({ name, caption, onProfileClick }: PostCardCaptionProps) => {
  const renderCaptionWithMentions = (text: string) => {
    // Split text by words and render with proper React elements
    const words = text.split(' ');
    
    return words.map((word, index) => {
      const key = `word-${index}`;
      
      if (word.startsWith('@')) {
        return (
          <span
            key={key}
            className="text-blue-400 cursor-pointer hover:underline"
            onClick={(e) => {
              e.stopPropagation();
              onProfileClick();
            }}
          >
            {word}{index < words.length - 1 ? ' ' : ''}
          </span>
        );
      }
      
      if (word.startsWith('#')) {
        return (
          <span key={key} className="text-purple-400">
            {word}{index < words.length - 1 ? ' ' : ''}
          </span>
        );
      }
      
      return (
        <span key={key}>
          {word}{index < words.length - 1 ? ' ' : ''}
        </span>
      );
    });
  };

  return (
    <div className="mt-2">
      <p className="text-sm text-gray-300">
        <span
          className="font-semibold text-white cursor-pointer hover:text-gray-300"
          onClick={onProfileClick}
        >
          {name}
        </span>
        {' '}
        <span>
          {renderCaptionWithMentions(caption)}
        </span>
      </p>
    </div>
  );
};

export default PostCardCaption;
