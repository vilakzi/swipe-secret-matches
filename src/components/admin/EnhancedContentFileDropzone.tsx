import React from "react";
import { Upload } from "lucide-react";

interface EnhancedContentFileDropzoneProps {
  onDrop: (acceptedFiles: File[]) => void;
  isDragActive: boolean;
  getRootProps: any;
  getInputProps: any;
  role: string;
  maxSize: number;
}

const EnhancedContentFileDropzone = ({
  isDragActive,
  getRootProps,
  getInputProps,
  role,
  maxSize,
}: EnhancedContentFileDropzoneProps) => {
  return (
    <div
      {...getRootProps({
        tabIndex: 0,
        role: "button",
        "aria-label": isDragActive
          ? "Drop the files here"
          : "Drag and drop files here, or click to select",
        "aria-describedby": "dropzone-description dropzone-limit",
        onKeyDown: (e: React.KeyboardEvent) => {
          if (e.key === " " || e.key === "Enter") {
            e.preventDefault();
            getInputProps().onClick?.(e);
          }
        },
        "aria-live": "polite"
      })}
      className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-purple-500 ${
        isDragActive ? "border-purple-500 bg-purple-50" : "border-gray-300 hover:border-gray-400"
      }`}
    >
      <input {...getInputProps()} aria-label="File upload input" />
      <Upload
        className="w-12 h-12 mx-auto mb-4 text-gray-400"
        aria-hidden="true"
        focusable="false"
      />
      {isDragActive ? (
        <p id="dropzone-description" className="text-purple-600" role="status">
          Drop the files here...
        </p>
      ) : (
        <div>
          <p className="text-lg font-medium text-gray-700 mb-2">
            Drag & drop files here, or click to select
          </p>
          <p className="text-sm text-gray-500" id="dropzone-description">
            Supports images and videos • Automatic duplicate detection • Media optimization
          </p>
        </div>
      )}
      <p
        id="dropzone-limit"
        className="text-sm text-gray-500 mt-2"
        aria-live="polite"
      >
        Max file size: {Math.round(maxSize / (1024 * 1024))}MB ({role})
      </p>
    </div>
  );
};

export default EnhancedContentFileDropzone;
