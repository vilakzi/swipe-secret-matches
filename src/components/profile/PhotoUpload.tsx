
import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Upload, Camera, X, Plus } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface PhotoUploadProps {
  photos: string[];
  onPhotosChange: (photos: string[]) => void;
  maxPhotos?: number;
}

const PhotoUpload = ({ photos, onPhotosChange, maxPhotos = 6 }: PhotoUploadProps) => {
  const { user } = useAuth();
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || !user) return;

    if (photos.length + files.length > maxPhotos) {
      toast({
        title: "Too many photos",
        description: `You can only upload up to ${maxPhotos} photos`,
        variant: "destructive"
      });
      return;
    }

    setUploading(true);
    try {
      const newPhotos: string[] = [];
      
      for (const file of Array.from(files)) {
        if (file.type.startsWith('image/')) {
          // Upload to Supabase Storage
          const fileExt = file.name.split('.').pop();
          const fileName = `${user.id}/profile_${Date.now()}_${Math.random()}.${fileExt}`;
          
          const { error: uploadError } = await supabase.storage
            .from('profiles')
            .upload(fileName, file);

          if (uploadError) throw uploadError;

          const { data: { publicUrl } } = supabase.storage
            .from('profiles')
            .getPublicUrl(fileName);

          newPhotos.push(publicUrl);
        }
      }

      onPhotosChange([...photos, ...newPhotos]);
      toast({
        title: "Photos uploaded",
        description: `${newPhotos.length} photo(s) added successfully`
      });
    } catch (error: any) {
      toast({
        title: "Upload failed",
        description: error.message || "Failed to upload photos. Please try again.",
        variant: "destructive"
      });
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const removePhoto = async (index: number) => {
    try {
      const photoUrl = photos[index];
      
      // Extract file path from URL for deletion
      if (photoUrl.includes('supabase.co')) {
        const urlParts = photoUrl.split('/');
        const fileName = urlParts[urlParts.length - 1];
        const filePath = `${user?.id}/${fileName}`;
        
        await supabase.storage
          .from('profiles')
          .remove([filePath]);
      }
      
      const newPhotos = photos.filter((_, i) => i !== index);
      onPhotosChange(newPhotos);
    } catch (error) {
      console.error('Error removing photo:', error);
      // Still remove from UI even if storage deletion fails
      const newPhotos = photos.filter((_, i) => i !== index);
      onPhotosChange(newPhotos);
    }
  };

  const triggerFileSelect = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-3">
        {/* Existing Photos */}
        {photos.map((photo, index) => (
          <Card key={index} className="relative aspect-square bg-gray-800 border-gray-700 overflow-hidden">
            <img
              src={photo}
              alt={`Photo ${index + 1}`}
              className="w-full h-full object-cover"
            />
            <button
              onClick={() => removePhoto(index)}
              className="absolute top-1 right-1 bg-red-500 hover:bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center transition-colors"
            >
              <X className="w-3 h-3" />
            </button>
            {index === 0 && (
              <div className="absolute bottom-1 left-1 bg-purple-600 text-white text-xs px-2 py-1 rounded">
                Main
              </div>
            )}
          </Card>
        ))}

        {/* Add Photo Button */}
        {photos.length < maxPhotos && (
          <Card 
            className="aspect-square bg-gray-800 border-gray-700 border-dashed cursor-pointer hover:bg-gray-700 transition-colors"
            onClick={triggerFileSelect}
          >
            <CardContent className="h-full flex flex-col items-center justify-center p-2">
              {uploading ? (
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-500"></div>
              ) : (
                <>
                  <Plus className="w-6 h-6 text-gray-400 mb-1" />
                  <span className="text-xs text-gray-400 text-center">Add Photo</span>
                </>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      {/* Upload Instructions */}
      <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-3">
        <div className="flex items-start space-x-2">
          <Camera className="w-4 h-4 text-purple-500 mt-0.5 flex-shrink-0" />
          <div className="text-sm">
            <p className="text-gray-300 font-medium">Photo Tips:</p>
            <ul className="text-gray-400 text-xs mt-1 space-y-1">
              <li>• Add {maxPhotos} photos to increase your chances</li>
              <li>• Your first photo will be your main profile picture</li>
              <li>• Use clear, recent photos of yourself</li>
              <li>• Include photos that show your personality</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* Alternative Upload Button */}
      {photos.length === 0 && (
        <Button
          onClick={triggerFileSelect}
          disabled={uploading}
          className="w-full bg-purple-600 hover:bg-purple-700"
        >
          <Upload className="w-4 h-4 mr-2" />
          {uploading ? 'Uploading...' : 'Upload Photos'}
        </Button>
      )}
    </div>
  );
};

export default PhotoUpload;
