
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Camera, X, Upload } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';

interface PhotoUploadStepProps {
  profileData: { photos: string[] };
  updateProfileData: (updates: any) => void;
}

const PhotoUploadStep = ({ profileData, updateProfileData }: PhotoUploadStepProps) => {
  const { user } = useAuth();
  const [uploading, setUploading] = useState(false);

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || !user) return;

    setUploading(true);
    const newPhotos = [...profileData.photos];

    try {
      for (let i = 0; i < Math.min(files.length, 5 - profileData.photos.length); i++) {
        const file = files[i];
        const fileExt = file.name.split('.').pop();
        const fileName = `${user.id}/profile_${Date.now()}_${i}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from('profiles')
          .upload(fileName, file);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('profiles')
          .getPublicUrl(fileName);

        newPhotos.push(publicUrl);
      }

      updateProfileData({ photos: newPhotos });
      
      toast({
        title: "Photos uploaded!",
        description: `Added ${Math.min(files.length, 5 - profileData.photos.length)} photo(s).`
      });
    } catch (error: any) {
      toast({
        title: "Upload failed",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setUploading(false);
    }
  };

  const removePhoto = (index: number) => {
    const newPhotos = profileData.photos.filter((_, i) => i !== index);
    updateProfileData({ photos: newPhotos });
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <p className="text-gray-300 mb-4">
          Upload 1-5 photos to showcase yourself. Your first photo will be your main profile picture.
        </p>
      </div>

      {/* Photo Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {profileData.photos.map((photo, index) => (
          <div key={index} className="relative aspect-square">
            <img
              src={photo}
              alt={`Profile ${index + 1}`}
              className="w-full h-full object-cover rounded-lg"
            />
            <button
              onClick={() => removePhoto(index)}
              className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-1"
            >
              <X className="w-4 h-4" />
            </button>
            {index === 0 && (
              <div className="absolute bottom-2 left-2 bg-purple-600 text-white text-xs px-2 py-1 rounded">
                Main
              </div>
            )}
          </div>
        ))}
        
        {/* Upload Button */}
        {profileData.photos.length < 5 && (
          <label className="aspect-square border-2 border-dashed border-gray-600 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-purple-500 transition-colors">
            <Camera className="w-8 h-8 text-gray-400 mb-2" />
            <span className="text-sm text-gray-400">Add Photo</span>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleImageUpload}
              className="hidden"
              disabled={uploading}
            />
          </label>
        )}
      </div>

      {uploading && (
        <div className="flex items-center justify-center text-gray-400">
          <Upload className="w-4 h-4 mr-2 animate-spin" />
          Uploading photos...
        </div>
      )}

      <div className="text-sm text-gray-400 text-center">
        {profileData.photos.length}/5 photos uploaded
      </div>
    </div>
  );
};

export default PhotoUploadStep;
