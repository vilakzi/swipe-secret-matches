import React from "react";
import { Button } from "@/components/ui/button";
import { Image, Video, X } from "lucide-react";
import type { UploadFile } from "./useContentUpload";

interface ContentFilePreviewProps {
  uploadFile: UploadFile;
  onRemove: (id: string) => void;
}

const ContentFilePreview = ({ uploadFile, onRemove }: ContentFilePreviewProps) => {
  return (
    <div className="relative group">
      <div className="aspect-video rounded-lg overflow-hidden bg-gray-100 flex items-center justify-center">
        {uploadFile.type === 'image' ? (
          <img
            src={uploadFile.preview}
            alt="Preview"
            className="w-full h-full object-cover object-center max-h-60"
            style={{ aspectRatio: '16/9' }}
          />
        ) : (
          <video
            src={uploadFile.preview}
            className="w-full h-full object-cover object-center max-h-60"
            style={{ aspectRatio: '16/9' }}
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
          <X className="w-4 h-4" />
        </Button>
      </div>
      <div className="absolute bottom-2 left-2">
        <div className="bg-black/70 text-white px-2 py-1 rounded text-xs flex items-center gap-1">
          {uploadFile.type === 'image' ? (
            <Image className="w-3 h-3" />
          ) : (
            <Video className="w-3 h-3" />
          )}
          {uploadFile.type}
        </div>
      </div>
      <div className="mt-2">
        <p className="text-sm font-medium truncate">
          {uploadFile.file.name}
        </p>
        <p className="text-xs text-gray-500">
          {(uploadFile.file.size / 1024 / 1024).toFixed(2)} MB
        </p>
      </div>
    </div>
  );
};

export default ContentFilePreview;
