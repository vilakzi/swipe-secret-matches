import * as React from 'react';
import { Textarea } from '@/components/ui/textarea';

interface CaptionSectionProps {
  caption: string;
  onCaptionChange: (caption: string) => void;
}

const CaptionSection = ({ caption, onCaptionChange }: CaptionSectionProps) => {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-300 mb-2">
        Caption/Description (Optional)
      </label>
      <Textarea
        value={caption}
        onChange={(e) => onCaptionChange(e.target.value)}
        placeholder="Write a caption for your post (optional)"
        className="bg-gray-800 border-gray-600 text-white"
        rows={3}
        aria-label="Caption or description"
      />
    </div>
  );
};

export default CaptionSection;
