
import React from 'react';
import { parseHyperlinks } from '@/utils/hyperlinkUtils';

interface PostCardCaptionProps {
  name: string;
  caption?: string;
  onProfileClick: () => void;
}

const PostCardCaption = ({ name, caption, onProfileClick }: PostCardCaptionProps) => {
  if (!caption) return null;

  const parsedCaption = parseHyperlinks(caption);

  return (
    <div className="pt-2">
      <p className="text-sm text-gray-300">
        <button 
          onClick={onProfileClick}
          className="font-semibold text-white hover:text-gray-300 transition-colors mr-2"
        >
          {name}
        </button>
        {parsedCaption.map((part, index) => (
          <React.Fragment key={index}>{part}</React.Fragment>
        ))}
      </p>
    </div>
  );
};

export default PostCardCaption;
