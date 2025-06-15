
import React from "react";
import { Upload } from "lucide-react";
import { useDropzone } from "react-dropzone";

interface EnhancedContentFileDropzoneProps {
  onDrop: (acceptedFiles: File[]) => void;
  isDragActive: boolean;
  getRootProps: any;
  getInputProps: any;
  role: string;
  maxSize: number;
}

const EnhancedContentFileDropzone = ({
  onDrop,
  isDragActive,
  getRootProps,
  getInputProps,
  role,
  maxSize,
}: EnhancedContentFileDropzoneProps) => {
  return (
    <div
      {...getRootProps()}
      className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer ${
        isDragActive ? "border-purple-500 bg-purple-50" : "border-gray-300 hover:border-gray-400"
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
            Supports images and videos • Automatic duplicate detection • Media optimization
          </p>
        </div>
      )}
      <p className="text-sm text-gray-500 mt-2">
        Max file size: {Math.round(maxSize / (1024 * 1024))}MB ({role})
      </p>
    </div>
  );
};

export default EnhancedContentFileDropzone;
