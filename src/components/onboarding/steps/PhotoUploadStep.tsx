
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Camera, X, Upload, ArrowUp, ArrowDown, Crop, Filter } from 'lucide-react';
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
  const [selectedPhoto, setSelectedPhoto] = useState<number | null>(null);

  const maxPhotos = 9;

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || !user) return;

    setUploading(true);
    const newPhotos = [...profileData.photos];

    try {
      for (let i = 0; i < Math.min(files.length, maxPhotos - profileData.photos.length); i++) {
        const file = files[i];
        
        // Basic image optimization
        const optimizedFile = await optimizeImage(file);
        
        const fileExt = optimizedFile.name.split('.').pop();
        const fileName = `${user.id}/profile_${Date.now()}_${i}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from('profiles')
          .upload(fileName, optimizedFile);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('profiles')
          .getPublicUrl(fileName);

        newPhotos.push(publicUrl);
      }

      updateProfileData({ photos: newPhotos });
      
      toast({
        title: "Photos uploaded!",
        description: `Added ${Math.min(files.length, maxPhotos - profileData.photos.length)} photo(s).`
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

  const optimizeImage = (file: File): Promise<File> => {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      
      img.onload = () => {
        const maxWidth = 1080;
        const maxHeight = 1080;
        let { width, height } = img;
        
        if (width > height) {
          if (width > maxWidth) {
            height = (height * maxWidth) / width;
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = (width * maxHeight) / height;
            height = maxHeight;
          }
        }
        
        canvas.width = width;
        canvas.height = height;
        
        ctx?.drawImage(img, 0, 0, width, height);
        
        canvas.toBlob((blob) => {
          if (blob) {
            const optimizedFile = new File([blob], file.name, {
              type: 'image/jpeg',
              lastModified: Date.now(),
            });
            resolve(optimizedFile);
          } else {
            resolve(file);
          }
        }, 'image/jpeg', 0.85);
      };
      
      img.src = URL.createObjectURL(file);
    });
  };

  const removePhoto = (index: number) => {
    const newPhotos = profileData.photos.filter((_, i) => i !== index);
    updateProfileData({ photos: newPhotos });
    setSelectedPhoto(null);
  };

  const movePhoto = (index: number, direction: 'up' | 'down') => {
    const newPhotos = [...profileData.photos];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    
    if (targetIndex >= 0 && targetIndex < newPhotos.length) {
      [newPhotos[index], newPhotos[targetIndex]] = [newPhotos[targetIndex], newPhotos[index]];
      updateProfileData({ photos: newPhotos });
    }
  };

  const setAsPrimary = (index: number) => {
    const newPhotos = [...profileData.photos];
    const [selectedPhoto] = newPhotos.splice(index, 1);
    newPhotos.unshift(selectedPhoto);
    updateProfileData({ photos: newPhotos });
    
    toast({
      title: "Primary photo updated",
      description: "This photo is now your main profile picture."
    });
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <p className="text-gray-300 mb-4">
          Upload 1-{maxPhotos} photos to showcase yourself. Your first photo will be your main profile picture.
        </p>
      </div>

      {/* Photo Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {profileData.photos.map((photo, index) => (
          <div 
            key={index} 
            className={`relative aspect-square cursor-pointer transition-all ${
              selectedPhoto === index ? 'ring-2 ring-purple-500' : ''
            }`}
            onClick={() => setSelectedPhoto(selectedPhoto === index ? null : index)}
          >
            <img
              src={photo}
              alt={`Profile ${index + 1}`}
              className="w-full h-full object-cover rounded-lg"
            />
            
            {/* Photo Controls */}
            <div className="absolute top-2 right-2 flex space-x-1">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  removePhoto(index);
                }}
                className="bg-red-500 hover:bg-red-600 text-white rounded-full p-1"
              >
                <X className="w-3 h-3" />
              </button>
            </div>

            {/* Primary Badge */}
            {index === 0 && (
              <div className="absolute bottom-2 left-2 bg-purple-600 text-white text-xs px-2 py-1 rounded">
                Main
              </div>
            )}

            {/* Photo Number */}
            <div className="absolute top-2 left-2 bg-black/60 text-white text-xs px-2 py-1 rounded">
              {index + 1}
            </div>

            {/* Selected Photo Controls */}
            {selectedPhoto === index && (
              <div className="absolute inset-0 bg-black/60 flex items-center justify-center rounded-lg">
                <div className="flex space-x-2">
                  {index !== 0 && (
                    <Button
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        setAsPrimary(index);
                      }}
                      className="bg-purple-600 hover:bg-purple-700"
                    >
                      Set as Main
                    </Button>
                  )}
                  {index > 0 && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={(e) => {
                        e.stopPropagation();
                        movePhoto(index, 'up');
                      }}
                    >
                      <ArrowUp className="w-4 h-4" />
                    </Button>
                  )}
                  {index < profileData.photos.length - 1 && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={(e) => {
                        e.stopPropagation();
                        movePhoto(index, 'down');
                      }}
                    >
                      <ArrowDown className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}
        
        {/* Upload Button */}
        {profileData.photos.length < maxPhotos && (
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
          Uploading and optimizing photos...
        </div>
      )}

      <div className="text-sm text-gray-400 text-center">
        {profileData.photos.length}/{maxPhotos} photos uploaded
      </div>

      {profileData.photos.length > 0 && (
        <div className="bg-blue-800/20 border border-blue-600/30 rounded-lg p-4">
          <h4 className="text-blue-400 font-medium mb-2">Photo Tips</h4>
          <ul className="text-blue-300 text-sm space-y-1">
            <li>• Click on a photo to reorder or set as main</li>
            <li>• Your first photo appears as your profile picture</li>
            <li>• Photos are automatically optimized for mobile</li>
          </ul>
        </div>
      )}
    </div>
  );
};

export default PhotoUploadStep;
