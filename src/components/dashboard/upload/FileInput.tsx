
import * as React from 'react';
import { Input } from '@/components/ui/input';
import { Wifi, WifiOff } from 'lucide-react';
import { useUserRole } from "@/hooks/useUserRole";
import { getMaxUploadSize } from "@/utils/getMaxUploadSize";

interface FileInputProps {
  isOnline: boolean;
  onFileChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

const FileInput = ({ isOnline, onFileChange }: FileInputProps) => {
  const { role } = useUserRole();
  const maxSize = getMaxUploadSize(role);

  return (
    <>
      <Input
        type="file"
        accept="image/jpeg,image/png,image/gif,image/webp,video/mp4,video/webm,video/quicktime"
        onChange={onFileChange}
        disabled={!isOnline}
        className="bg-gray-800 border-gray-600 text-white file:bg-purple-600 file:text-white file:border-0 file:rounded file:px-3 file:py-1 file:mr-3 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
      />
      <div className="flex items-center justify-between mt-1">
        <p className="text-xs text-gray-400">
          Max: {Math.round(maxSize / (1024*1024))}MB ({role})
        </p>
        <div className="flex items-center space-x-1">
          {isOnline ? (
            <Wifi className="w-3 h-3 text-green-400" />
          ) : (
            <WifiOff className="w-3 h-3 text-red-400" />
          )}
          <span className="text-xs text-gray-400">
            {isOnline ? 'Online' : 'Offline'}
          </span>
        </div>
      </div>
    </>
  );
};

export default FileInput;
