
import React from "react";
import { Upload } from "lucide-react";
import { useDropzone } from "react-dropzone";

interface ContentFileDropzoneProps {
  onDrop: (acceptedFiles: File[]) => void;
}

const ContentFileDropzone = ({ onDrop }: ContentFileDropzoneProps) => {
  const {
    getRootProps,
    getInputProps,
    isDragActive,
  } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.webp'],
      'video/*': ['.mp4', '.webm', '.ogg', '.mov']
    },
    multiple: true,
  });

  return (
    <div
      {...getRootProps()}
      className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer ${
        isDragActive ? 'border-purple-500 bg-purple-50' : 'border-gray-300 hover:border-gray-400'
      }`}
    >
      <input {...getInputProps()} />
      <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400" />
      {isDragActive ? (
        <p className="text-purple-600">Drop the files here...</p>
      ) : (
        <div>
          <p className="text-lg font-medium text-gray-700 mb-2">
            Drag & drop files here, or click to select
          </p>
          <p className="text-sm text-gray-500">
            Supports images and videos (unlimited uploads)
          </p>
        </div>
      )}
    </div>
  );
};

export default ContentFileDropzone;
