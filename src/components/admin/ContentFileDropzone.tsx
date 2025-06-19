import React from "react";
import { Upload } from "lucide-react";

/**
 * Accepts the dropzone props from useDropzone,
 * adds ARIA and keyboard support.
 */
interface ContentFileDropzoneProps {
  onDrop: (acceptedFiles: File[]) => void;
  getRootProps?: (options?: any) => any;
  getInputProps?: (options?: any) => any;
  isDragActive?: boolean;
}

const ContentFileDropzone = ({
  onDrop,
  getRootProps,
  getInputProps,
  isDragActive,
}: ContentFileDropzoneProps) => {
  // Fallback: if no dropzone props, create them (classic behavior)
  // This allows both controlled (Enhanced-like) and uncontrolled mode
  if (!getRootProps || !getInputProps) {
    return (
      <div
        className="border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer border-gray-300 hover:border-gray-400"
        onClick={() => document.getElementById("classic-dropzone-input")?.click()}
        tabIndex={0}
        role="button"
        aria-label="Drag and drop files here, or click to select"
        aria-describedby="classic-dropzone-description"
        onKeyDown={(e: React.KeyboardEvent<HTMLDivElement>) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            document.getElementById("classic-dropzone-input")?.click();
          }
        }}
      >
        <input
          id="classic-dropzone-input"
          type="file"
          hidden
          multiple
          accept="image/*,video/*"
          onChange={e => {
            if (e.target.files) onDrop(Array.from(e.target.files));
          }}
        />
        <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400" aria-hidden="true" />
        <div>
          <p className="text-lg font-medium text-gray-700 mb-2">
            Drag & drop files here, or click to select
          </p>
          <p className="text-sm text-gray-500" id="classic-dropzone-description">
            Supports images and videos (classic style)
          </p>
        </div>
      </div>
    );
  }

  // Enhanced ARIA/Keyboard dropzone
  return (
    <div
      {...getRootProps({
        tabIndex: 0,
        role: "button",
        "aria-label": isDragActive
          ? "Drop the files here"
          : "Drag and drop files here, or click to select",
        "aria-describedby": "classic-dropzone-description",
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
      <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400" aria-hidden="true" />
      {isDragActive ? (
        <p className="text-purple-600" role="status">
          Drop the files here...
        </p>
      ) : (
        <div>
          <p className="text-lg font-medium text-gray-700 mb-2">
            Drag & drop files here, or click to select
          </p>
          <p className="text-sm text-gray-500" id="classic-dropzone-description">
            Supports images and videos (classic style)
          </p>
        </div>
      )}
    </div>
  );
};

export default ContentFileDropzone;
