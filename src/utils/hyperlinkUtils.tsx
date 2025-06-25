
import React from 'react';

// Regex to match URLs
const URL_REGEX = /(https?:\/\/[^\s]+)/g;

export const parseHyperlinks = (text: string): React.ReactNode[] => {
  if (!text) return [];

  const parts = text.split(URL_REGEX);
  
  return parts.map((part, index) => {
    if (URL_REGEX.test(part)) {
      return (
        <a
          key={index}
          href={part}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-400 hover:text-blue-300 underline break-all"
          onClick={(e) => e.stopPropagation()}
        >
          {part}
        </a>
      );
    }
    return <span key={index}>{part}</span>;
  });
};

export const containsHyperlinks = (text: string): boolean => {
  return URL_REGEX.test(text);
};

export const extractUrls = (text: string): string[] => {
  const matches = text.match(URL_REGEX);
  return matches || [];
};
