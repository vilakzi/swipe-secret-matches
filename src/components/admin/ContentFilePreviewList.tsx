import ContentFilePreview from "./ContentFilePreview";
import type { UploadFile } from "./useContentUpload";

interface ContentFilePreviewListProps {
  uploadFiles: UploadFile[];
  onRemove: (id: string) => void;
}

const ContentFilePreviewList = ({
  uploadFiles,
  onRemove,
}: ContentFilePreviewListProps) => {
  if (uploadFiles.length === 0) return null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {uploadFiles.map((uploadFile) => (
        <ContentFilePreview
          key={uploadFile.id}
          uploadFile={uploadFile}
          onRemove={onRemove}
        />
      ))}
    </div>
  );
};

export default ContentFilePreviewList;
