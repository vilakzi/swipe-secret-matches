
import React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Image, Video, X, AlertTriangle } from "lucide-react";

export interface EnhancedContentFilePreviewProps {
  uploadFile: {
    id: string;
    file: File;
    preview: string;
    type: "image" | "video";
    isDuplicate?: boolean;
  };
  onRemove: (id: string) => void;
}

const EnhancedContentFilePreview = ({
  uploadFile,
  onRemove,
}: EnhancedContentFilePreviewProps) => {
  // Add descriptive alt text and aria for improved accessibility.
  const altText =
    uploadFile.type === "image"
      ? `Preview of image file ${uploadFile.file.name}`
      : `Preview of video file ${uploadFile.file.name}`;

  return (
    <div className="relative group" aria-label={altText}>
      <div className="aspect-video rounded-lg overflow-hidden bg-gray-100">
        {uploadFile.type === "image" ? (
          <img
            src={uploadFile.preview}
            alt={altText}
            className="w-full h-full object-cover"
          />
        ) : (
          <video
            src={uploadFile.preview}
            className="w-full h-full object-cover"
            aria-label={altText}
            controls
          />
        )}
      </div>

      <div className="absolute top-2 right-2">
        <Button
          size="sm"
          variant="destructive"
          onClick={() => onRemove(uploadFile.id)}
          className="h-8 w-8 p-0"
          aria-label={`Remove file ${uploadFile.file.name}`}
        >
          <X className="w-4 h-4" aria-hidden="true" />
        </Button>
      </div>

      <div className="absolute bottom-2 left-2">
        <div className="bg-black/70 text-white px-2 py-1 rounded text-xs flex items-center gap-1">
          {uploadFile.type === "image" ? (
            <Image className="w-3 h-3" aria-label="Image file" aria-hidden="true" />
          ) : (
            <Video className="w-3 h-3" aria-label="Video file" aria-hidden="true" />
          )}
          {uploadFile.type}
        </div>
      </div>

      {uploadFile.isDuplicate && (
        <div className="absolute top-2 left-2">
          <Badge variant="destructive" className="text-xs" aria-label="Duplicate file">
            <AlertTriangle className="w-3 h-3 mr-1" aria-hidden="true" />
            Duplicate
          </Badge>
        </div>
      )}

      <div className="mt-2">
        <p className="text-sm font-medium truncate">{uploadFile.file.name}</p>
        <p className="text-xs text-gray-500">
          {(uploadFile.file.size / 1024 / 1024).toFixed(2)} MB
        </p>
      </div>
    </div>
  );
};

export default EnhancedContentFilePreview;

