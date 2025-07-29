import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Upload, X, Camera, Video } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface CreateStoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStoryCreated: () => void;
}

export const CreateStoryModal: React.FC<CreateStoryModalProps> = ({
  isOpen,
  onClose,
  onStoryCreated,
}) => {
  const { user } = useAuth();
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    // Check file type
    if (!selectedFile.type.startsWith('image/') && !selectedFile.type.startsWith('video/')) {
      toast({
        title: "Invalid file type",
        description: "Please select an image or video file",
        variant: "destructive",
      });
      return;
    }

    // Check file size (max 50MB)
    if (selectedFile.size > 50 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "File size must be less than 50MB",
        variant: "destructive",
      });
      return;
    }

    setFile(selectedFile);
    setPreview(URL.createObjectURL(selectedFile));
  };

  const handleUpload = async () => {
    if (!file || !user) return;

    setUploading(true);
    try {
      // Upload file to Supabase storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;
      
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('posts')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('posts')
        .getPublicUrl(fileName);

      // Create story record
      const { error: insertError } = await supabase
        .from('stories')
        .insert({
          user_id: user.id,
          content_url: publicUrl,
          story_type: file.type.startsWith('image/') ? 'image' : 'video',
        });

      if (insertError) throw insertError;

      toast({
        title: "Story created!",
        description: "Your story has been shared successfully",
      });

      onStoryCreated();
      handleClose();
    } catch (error) {
      console.error('Error uploading story:', error);
      toast({
        title: "Upload failed",
        description: "Failed to create story. Please try again.",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const handleClose = () => {
    setFile(null);
    setPreview(null);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md bg-gray-900 text-white border-gray-700">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            Create Story
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClose}
              className="h-auto p-1 text-gray-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </Button>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {!preview ? (
            <div className="border-2 border-dashed border-gray-600 rounded-lg p-8 text-center">
              <div className="flex flex-col items-center space-y-4">
                <div className="flex space-x-4">
                  <Camera className="w-8 h-8 text-gray-400" />
                  <Video className="w-8 h-8 text-gray-400" />
                </div>
                <div>
                  <p className="text-gray-400 mb-2">Select a photo or video</p>
                  <Input
                    type="file"
                    accept="image/*,video/*"
                    onChange={handleFileSelect}
                    className="hidden"
                    id="story-file"
                  />
                  <label htmlFor="story-file">
                    <Button variant="outline" className="cursor-pointer" asChild>
                      <span>
                        <Upload className="w-4 h-4 mr-2" />
                        Choose File
                      </span>
                    </Button>
                  </label>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="relative bg-black rounded-lg overflow-hidden max-h-80">
                {file?.type.startsWith('image/') ? (
                  <img
                    src={preview}
                    alt="Story preview"
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <video
                    src={preview}
                    controls
                    className="w-full h-full object-contain"
                  />
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setFile(null);
                    setPreview(null);
                  }}
                  className="absolute top-2 right-2 bg-black/50 hover:bg-black/70"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>

              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setFile(null);
                    setPreview(null);
                  }}
                  className="flex-1"
                >
                  Choose Different
                </Button>
                <Button
                  onClick={handleUpload}
                  disabled={uploading}
                  className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                >
                  {uploading ? 'Sharing...' : 'Share Story'}
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};