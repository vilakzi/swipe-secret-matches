import React from "react";
import { Button } from "@/components/ui/button";

interface UploadFile {
  id: string;
  file: File;
  preview: string;
  type: "image" | "video";
}

interface ContentBulkActionsProps {
  uploadFiles: UploadFile[];
  uploading: boolean;
  handleBulkUpload: () => void;
}

const ContentBulkActions = ({
  uploadFiles,
  uploading,
  handleBulkUpload,
}: ContentBulkActionsProps) => {
  if (uploadFiles.length === 0) return null;
  return (
    <div
      className="flex items-center justify-between mt-1 mb-3"
      aria-busy={uploading}
    >
      <h3 className="text-lg font-medium">
        Files Ready for Upload ({uploadFiles.length})
      </h3>
      <Button
        onClick={handleBulkUpload}
        disabled={uploading}
        className="bg-purple-600 hover:bg-purple-700"
        aria-describedby="classic-upload-helper-tip"
        aria-busy={uploading}
      >
        {uploading ? "Uploading..." : "Upload All"}
      </Button>
    </div>
  );
};

export default ContentBulkActions;
