import React from "react";
import { Button } from "@/components/ui/button";

interface UploadFile {
  id: string;
  file: File;
  preview: string;
  type: "image" | "video";
  isDuplicate?: boolean;
  hash?: string;
}

interface EnhancedContentBulkActionsProps {
  uploadFiles: UploadFile[];
  uploading: boolean;
  handleBulkUpload: () => void;
}

const EnhancedContentBulkActions = ({
  uploadFiles,
  uploading,
  handleBulkUpload,
}: EnhancedContentBulkActionsProps) => {
  if (uploadFiles.length === 0) return null;
  return (
    <div className="flex items-center justify-between">
      <h3 className="text-lg font-medium">
        Files Ready for Upload ({uploadFiles.length})
      </h3>
      <Button
        onClick={handleBulkUpload}
        disabled={uploading}
        aria-describedby="upload-helper-tip"
        className="bg-purple-600 hover:bg-purple-700"
      >
        {uploading ? "Processing..." : "Upload All for Review"}
      </Button>
    </div>
  );
};

export default EnhancedContentBulkActions;
