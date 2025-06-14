import React from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { X, Image, Video, CheckCircle } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { useUserRole } from "@/hooks/useUserRole";
import { getMaxUploadSize } from "@/utils/getMaxUploadSize";

interface FileUploadSectionProps {
  selectedFile: File | null;
  onFileChange: (file: File | null) => void;
}

const FileUploadSection = ({ selectedFile, onFileChange }: FileUploadSectionProps) => {
  const { role } = useUserRole();
  const maxSize = getMaxUploadSize(role);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const isImage = file.type.startsWith('image/');
      const isVideo = file.type.startsWith('video/');
      
      if (!isImage && !isVideo) {
        toast({
          title: "Invalid file type",
          description: "Please select an image or video file.",
          variant: "destructive",
        });
        return;
      }

      if (file.size > maxSize) {
        toast({
          title: "File too large",
          description: `Maximum allowed: ${Math.round(maxSize / (1024*1024))}MB (${role === "admin" ? "Admin" : "Provider/User"} limit)`,
          variant: "destructive",
        });
        return;
      }

      onFileChange(file);
      toast({
        title: "File ready for upload",
        description: `${file.name} is ready to be uploaded.`,
      });
    }
  };

  const removeFile = () => {
    onFileChange(null);
    toast({
      title: "File removed",
      description: "Please select another file to upload.",
    });
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Upload Image or Video
        </label>
        
        {!selectedFile ? (
          <>
            <Input
              type="file"
              accept="image/*,video/*"
              onChange={handleFileChange}
              className="bg-gray-800 border-gray-600 text-white file:bg-purple-600 file:text-white file:border-0 file:rounded file:px-3 file:py-1 file:mr-3 cursor-pointer"
            />
            <p className="text-xs text-gray-400 mt-1">
              Images: Any size | Videos: Max {Math.round(maxSize / (1024*1024))}MB ({role})
            </p>
          </>
        ) : (
          <div className="bg-gray-800 border border-gray-600 rounded-lg p-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-3 flex-1">
                <div className="flex-shrink-0">
                  {selectedFile.type.startsWith('image/') ? (
                    <Image className="w-8 h-8 text-green-400" />
                  ) : (
                    <Video className="w-8 h-8 text-green-400" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white font-medium truncate">{selectedFile.name}</p>
                  <p className="text-gray-400 text-sm">
                    {formatFileSize(selectedFile.size)} • {selectedFile.type.startsWith('image/') ? 'Image' : 'Video'}
                  </p>
                  <div className="flex items-center mt-2">
                    <CheckCircle className="w-4 h-4 text-green-400 mr-2" />
                    <span className="text-green-400 text-sm font-medium">Ready for upload</span>
                  </div>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={removeFile}
                className="text-gray-400 hover:text-white hover:bg-gray-700"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
            
            {selectedFile.type.startsWith('image/') && (
              <div className="mt-3 rounded-lg overflow-hidden">
                <img
                  src={URL.createObjectURL(selectedFile)}
                  alt="Preview"
                  className="w-full h-32 object-cover"
                  onLoad={() => URL.revokeObjectURL(URL.createObjectURL(selectedFile))}
                />
              </div>
            )}
          </div>
        )}
      </div>
      
      {selectedFile && (
        <div className="bg-green-900/20 border border-green-600/30 rounded-lg p-3">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <span className="text-green-400 text-sm font-medium">
              File is ready! Click "Submit & Upload Post" to continue.
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default FileUploadSection;
