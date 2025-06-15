
import React from "react";
import EnhancedContentFilePreview from "./EnhancedContentFilePreview";

interface UploadFile {
  id: string;
  file: File;
  preview: string;
  type: "image" | "video";
  isDuplicate?: boolean;
  hash?: string;
}

interface EnhancedContentFileListProps {
  uploadFiles: UploadFile[];
  onRemove: (id: string) => void;
}

const EnhancedContentFileList = ({
  uploadFiles,
  onRemove,
}: EnhancedContentFileListProps) => {
  if (uploadFiles.length === 0) return null;
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {uploadFiles.map((uploadFile) => (
        <EnhancedContentFilePreview
          key={uploadFile.id}
          uploadFile={uploadFile}
          onRemove={onRemove}
        />
      ))}
    </div>
  );
};

export default EnhancedContentFileList;
