
import React from 'react';
import { Input } from '@/components/ui/input';
import { toast } from '@/hooks/use-toast';

interface FileUploadSectionProps {
  selectedFile: File | null;
  onFileChange: (file: File | null) => void;
}

const FileUploadSection = ({ selectedFile, onFileChange }: FileUploadSectionProps) => {
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const isImage = file.type.startsWith('image/');
      const isVideo = file.type.startsWith('video/');
      
      if (!isImage && !isVideo) {
        toast({
          title: "Invalid file type",
          description: "Please select an image or video file.",
          variant: "destructive",
        });
        return;
      }

      if (isVideo && file.size > 30 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Video files must be 30MB or less.",
          variant: "destructive",
        });
        return;
      }

      onFileChange(file);
    }
  };

  return (
    <div>
      <label className="block text-sm font-medium text-gray-300 mb-2">
        Upload Image or Video
      </label>
      <Input
        type="file"
        accept="image/*,video/*"
        onChange={handleFileChange}
        className="bg-gray-800 border-gray-600 text-white"
      />
      <p className="text-xs text-gray-400 mt-1">
        Images: Any size | Videos: Max 30MB
      </p>
      {selectedFile && (
        <p className="text-sm text-green-400 mt-1">
          Selected: {selectedFile.name}
        </p>
      )}
    </div>
  );
};

export default FileUploadSection;
