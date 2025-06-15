import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Filter, Image, Video, RotateCcw } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';

interface FeedHeaderProps {
  showFilters: boolean;
  setShowFilters: (show: boolean) => void;
  onImageUpload: () => void;
  onVideoUpload: () => void;
  onRefresh?: () => void;
}

const FeedHeader = ({
  showFilters,
  setShowFilters,
  onImageUpload,
  onVideoUpload,
  onRefresh
}: FeedHeaderProps) => {
  const { user } = useAuth();

  const handleFileUpload = async (file: File, type: 'image' | 'video') => {
    if (!user) {
      toast({
        title: "Please log in",
        description: "You need to be logged in to upload content",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (50MB max)
    const maxSize = 50 * 1024 * 1024;
    if (file.size > maxSize) {
      toast({
        title: "File too large",
        description: "Maximum file size is 50MB",
        variant: "destructive",
      });
      return;
    }

    // Validate file type
    const isValidType = type === 'image' ? file.type.startsWith('image/') : file.type.startsWith('video/');
    if (!isValidType) {
      toast({
        title: "Invalid file type",
        description: `Please select a valid ${type} file`,
        variant: "destructive",
      });
      return;
    }

    try {
      console.log(`Starting ${type} upload for file:`, file.name);
      
      // For demo purposes, use a placeholder URL
      const demoUrl = type === 'image' 
        ? `https://picsum.photos/400/600?random=${Date.now()}` 
        : 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4';

      // Create post entry in database
      const { data: postData, error: postError } = await supabase
        .from('posts')
        .insert({
          provider_id: user.id,
          content_url: demoUrl,
          post_type: type,
          caption: `New ${type} post`,
          promotion_type: 'free_2h',
          expires_at: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
          is_promoted: false,
          payment_status: 'paid'
        })
        .select()
        .single();

      if (postError) {
        console.error('Post creation error:', postError);
        throw postError;
      }

      console.log('Post created successfully:', postData);

      toast({
        title: "Upload successful!",
        description: `Your ${type} has been uploaded and posted to the feed.`,
      });

      // Trigger refresh
      if (onRefresh) {
        onRefresh();
      }
      
    } catch (error: any) {
      console.error('Upload failed:', error);
      toast({
        title: "Upload failed",
        description: error.message || "Something went wrong during upload",
        variant: "destructive",
      });
    }
  };

  const createFileInput = (accept: string, onFileSelect: (file: File) => void) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = accept;
    input.style.display = 'none';
    
    const handleChange = (e: Event) => {
      const target = e.target as HTMLInputElement;
      const file = target.files?.[0];
      if (file) {
        onFileSelect(file);
      }
      // Clean up
      input.removeEventListener('change', handleChange);
      document.body.removeChild(input);
    };
    
    input.addEventListener('change', handleChange);
    document.body.appendChild(input);
    input.click();
  };

  const handleImageUpload = () => {
    createFileInput('image/*', (file) => handleFileUpload(file, 'image'));
  };

  const handleVideoUpload = () => {
    createFileInput('video/*', (file) => handleFileUpload(file, 'video'));
  };

  return (
    <div className="space-y-4">
      {/* Actions Row - Search removed */}
      <div className="flex items-center space-x-2">
        <div className="flex-1" />
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowFilters(!showFilters)}
          className="text-white hover:bg-white/10"
        >
          <Filter className="w-4 h-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={onRefresh}
          className="text-white hover:bg-white/10"
          title="Refresh Feed"
        >
          <RotateCcw className="w-4 h-4" />
        </Button>
        {user && (
          <>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleImageUpload}
              className="text-white hover:bg-white/10"
              title="Upload Image"
            >
              <Image className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleVideoUpload}
              className="text-white hover:bg-white/10"
              title="Upload Video"
            >
              <Video className="w-4 h-4" />
            </Button>
          </>
        )}
      </div>
      {/* Filters panel (now only general content) */}
      {showFilters && (
        <div className="bg-gray-800/50 rounded-lg p-4 space-y-3">
          <h3 className="text-white font-medium">Filters</h3>
          <div className="text-gray-400 text-sm">Feed filtering is disabled. All content is shown uniformly.</div>
        </div>
      )}
    </div>
  );
};

export default FeedHeader;
