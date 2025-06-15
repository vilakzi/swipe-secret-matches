
import React from "react";
import { Button } from "@/components/ui/button";
import { Image, Video, X } from "lucide-react";
import type { UploadFile } from "./useContentUpload";

interface ContentFilePreviewListProps {
  uploadFiles: UploadFile[];
  onRemove: (id: string) => void;
}

const ContentFilePreviewList = ({ uploadFiles, onRemove }: ContentFilePreviewListProps) => {
  if (uploadFiles.length === 0) return null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {uploadFiles.map((uploadFile) => (
        <div key={uploadFile.id} className="relative group">
          <div className="aspect-video rounded-lg overflow-hidden bg-gray-100">
            {uploadFile.type === 'image' ? (
              <img
                src={uploadFile.preview}
                alt="Preview"
                className="w-full h-full object-cover"
              />
            ) : (
              <video
                src={uploadFile.preview}
                className="w-full h-full object-cover"
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
      ))}
    </div>
  );
};

export default ContentFilePreviewList;
