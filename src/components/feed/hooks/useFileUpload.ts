import { useAuth } from '@/contexts/AuthContext';
import { useUserRole } from "@/hooks/useUserRole";
import { getMaxUploadSize } from "@/utils/getMaxUploadSize";
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

export const useFileUpload = (onRefresh?: () => void) => {
  const { user } = useAuth();
  const { role } = useUserRole();
  const maxSize = getMaxUploadSize(role);

  const handleFileUpload = async (file: File, type: 'image' | 'video') => {
    if (!user) {
      toast({
        title: "Please log in",
        description: "You need to be logged in to upload content",
        variant: "destructive",
      });
      return;
    }

    // Mobile-optimized file size validation
    if (file.size > maxSize) {
      toast({
        title: "File too large",
        description: `Maximum file size is ${Math.round(maxSize / (1024*1024))}MB for ${role} accounts`,
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
      console.log(`Starting mobile ${type} upload for file:`, file.name, 'Size:', file.size);
      
      // Show initial upload toast
      toast({
        title: "Starting upload",
        description: `Uploading ${type}... Please wait`,
      });
      
      // Generate unique filename
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/mobile_${type}_${Date.now()}.${fileExt}`;
      
      // Mobile-optimized upload to Supabase Storage
      const uploadOptions = {
        cacheControl: '3600',
        upsert: false,
        contentType: file.type,
        duplex: 'half' as RequestDuplex
      };

      const { data, error: uploadError } = await supabase.storage
        .from('posts')
        .upload(fileName, file, uploadOptions);

      if (uploadError) {
        console.error('Mobile upload error:', uploadError);
        throw new Error(`Upload failed: ${uploadError.message}`);
      }

      console.log('Mobile upload successful:', data);

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('posts')
        .getPublicUrl(fileName);

      if (!publicUrl) {
        throw new Error('Failed to get public URL');
      }

      console.log('Public URL generated:', publicUrl);

      // Create post entry in database
      const { data: postData, error: postError } = await supabase
        .from('posts')
        .insert({
          provider_id: user.id,
          content_url: publicUrl,
          post_type: type,
          caption: `New ${type} post from mobile`,
          promotion_type: 'free_2h',
          expires_at: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
          is_promoted: false,
          payment_status: 'paid'
        })
        .select()
        .single();

      if (postError) {
        console.error('Mobile post creation error:', postError);
        throw new Error(`Failed to create post: ${postError.message}`);
      }

      console.log('Mobile post created successfully:', postData);

      toast({
        title: "Upload successful!",
        description: `Your ${type} has been uploaded and posted to the feed.`,
      });

      // Trigger refresh
      if (onRefresh) {
        onRefresh();
      }
      
    } catch (error: any) {
      console.error('Mobile upload failed:', error);
      
      let errorMessage = "Something went wrong during upload";
      
      if (error.message?.includes('fetch')) {
        errorMessage = "Network error. Please check your mobile connection and try again.";
      } else if (error.message?.includes('timeout')) {
        errorMessage = "Upload timeout. Please try with a smaller file or better connection.";
      } else if (error.message?.includes('413')) {
        errorMessage = "File too large for mobile upload.";
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      toast({
        title: "Upload failed",
        description: errorMessage,
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

  return {
    handleImageUpload,
    handleVideoUpload,
    maxSize,
    user
  };
};
