
import * as React from 'react';
import { sanitizeHtml } from '@/utils/inputSanitization';
import { validateUserInput } from '@/utils/securityValidation';

interface SecurePostCardProps {
  content: string;
  author: string;
  className?: string;
}

const SecurePostCard: React.FC<SecurePostCardProps> = ({ content, author, className = '' }) => {
  // Validate and sanitize content before rendering
  const isValidContent = validateUserInput(content);
  const isValidAuthor = validateUserInput(author);

  if (!isValidContent || !isValidAuthor) {
    return (
      <div className={`p-4 border border-red-500 rounded-lg bg-red-50 ${className}`}>
        <p className="text-red-700">Content blocked for security reasons</p>
      </div>
    );
  }

  const sanitizedContent = sanitizeHtml(content);
  const sanitizedAuthor = sanitizeHtml(author);

  return (
    <div className={`p-4 border border-gray-200 rounded-lg ${className}`}>
      <div className="mb-2">
        <span className="font-semibold text-gray-800">{sanitizedAuthor}</span>
      </div>
      <div className="text-gray-700">
        {sanitizedContent}
      </div>
    </div>
  );
};

export default SecurePostCard;
