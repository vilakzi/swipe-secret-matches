import React, { useState } from 'react';
import { useNetworkStatus } from '../hooks/useNetworkStatus';
import { Button } from '@/components/ui/button';
import { AlertCircle, Upload, Check, X } from 'lucide-react';

interface UploadButtonProps {
  onUpload: (file: File) => Promise&lt;boolean&gt;;
}

export const UploadButton: React.FC&lt;UploadButtonProps&gt; = ({ onUpload }) =&gt; {
  const isOnline = useNetworkStatus();
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState&lt;'idle' | 'success' | 'error'&gt;('idle');

  const handleFileChange = async (event: React.ChangeEvent&lt;HTMLInputElement&gt;) =&gt; {
    const file = event.target.files?.[0];
    if (file) {
      setIsUploading(true);
      setUploadStatus('idle');
      try {
        const success = await onUpload(file);
        setUploadStatus(success ? 'success' : 'error');
      } catch (error) {
        setUploadStatus('error');
      } finally {
        setIsUploading(false);
      }
    }
  };

  return (
    &lt;div className="flex flex-col items-center space-y-4"&gt;
      &lt;input
        type="file"
        onChange={handleFileChange}
        className="hidden"
        id="upload-input"
        disabled={!isOnline || isUploading}
      /&gt;
      &lt;label htmlFor="upload-input"&gt;
        &lt;Button disabled={!isOnline || isUploading} variant="outline"&gt;
          {isUploading ? (
            &lt;Upload className="mr-2 h-4 w-4 animate-spin" /&gt;
          ) : (
            &lt;Upload className="mr-2 h-4 w-4" /&gt;
          )}
          {isOnline
            ? isUploading
              ? 'Uploading...'
              : 'Upload File'
            : 'Offline - Cannot Upload'}
        &lt;/Button&gt;
      &lt;/label&gt;
      {!isOnline &amp;&amp; (
        &lt;div className="flex items-center text-yellow-500"&gt;
          &lt;AlertCircle className="mr-2" size={16} /&gt;
          &lt;p className="text-sm"&gt;You are currently offline. Please check your internet connection.&lt;/p&gt;
        &lt;/div&gt;
      )}
      {uploadStatus === 'success' &amp;&amp; (
        &lt;div className="flex items-center text-green-500"&gt;
          &lt;Check className="mr-2" size={16} /&gt;
          &lt;p className="text-sm"&gt;File uploaded successfully!&lt;/p&gt;
        &lt;/div&gt;
      )}
      {uploadStatus === 'error' &amp;&amp; (
        &lt;div className="flex items-center text-red-500"&gt;
          &lt;X className="mr-2" size={16} /&gt;
          &lt;p className="text-sm"&gt;Error uploading file. Please try again.&lt;/p&gt;
        &lt;/div&gt;
      )}
    &lt;/div&gt;
  );
};