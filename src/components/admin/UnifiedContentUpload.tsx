
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Upload, Crown } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import FileUploadSection from '@/components/dashboard/upload/FileUploadSection';
import CaptionSection from '@/components/dashboard/upload/CaptionSection';
import PostCard from '@/components/dashboard/PostCard';

type Step = 1 | 2 | 3;

const UnifiedContentUpload = () => {
  const { user } = useAuth();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [caption, setCaption] = useState('');
  const [uploading, setUploading] = useState(false);
  const [step, setStep] = useState<Step>(1);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [newPost, setNewPost] = useState<any>(null);

  const resetForm = () => {
    setSelectedFile(null);
    setCaption('');
    setPreviewUrl(null);
    setNewPost(null);
    setStep(1);
  };

  // Step 1: Select file
  const handleFileChange = (file: File | null) => {
    setSelectedFile(file);
    setCaption('');
    setNewPost(null);
    if (file) {
      setPreviewUrl(URL.createObjectURL(file));
      setStep(2);
    } else {
      setPreviewUrl(null);
      setStep(1);
    }
  };

  // Step 2: Preview & details, then upload
  const handleUpload = async () => {
    if (!selectedFile || !user) {
      toast({
        title: "No file or user",
        description: "Please select a file and try again.",
        variant: "destructive"
      });
      return;
    }

    setUploading(true);

    try {
      const fileExt = selectedFile.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;

      // Upload file to Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('posts')
        .upload(fileName, selectedFile);

      if (uploadError) {
        toast({
          title: "Storage upload failed",
          description: uploadError.message,
          variant: "destructive"
        });
        setUploading(false);
        return;
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('posts')
        .getPublicUrl(fileName);

      if (!publicUrl) {
        toast({
          title: "Get public URL failed",
          description: "Could not get URL for uploaded file.",
          variant: "destructive"
        });
        setUploading(false);
        return;
      }

      // Admin posts get 30 days expiry by default
      const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
      const postType = selectedFile.type.startsWith('image/') ? 'image' : 'video';

      // Insert post record to DB - admin posts are automatically paid/promoted
      const { data: postData, error: postError } = await supabase
        .from('posts')
        .insert({
          provider_id: user.id,
          content_url: publicUrl,
          post_type: postType,
          caption: caption.trim() || null,
          promotion_type: 'paid_12h', // Admin posts use extended promotion
          expires_at: expiresAt.toISOString(),
          is_promoted: true,
          payment_status: 'paid' // Admin posts are auto-approved
        })
        .select()
        .single();

      if (postError) {
        toast({
          title: "Post creation failed",
          description: postError.message,
          variant: "destructive"
        });
        setUploading(false);
        return;
      }

      // Step 3: Show success
      setNewPost(postData);
      setStep(3);

      toast({
        title: "Admin content uploaded successfully!",
        description: "Your content is now live in the feed.",
      });

      setSelectedFile(null);
      setCaption('');
      setPreviewUrl(null);
    } catch (error: any) {
      toast({
        title: "Upload failed",
        description: error.message ?? String(error),
        variant: "destructive"
      });
    } finally {
      setUploading(false);
    }
  };

  // Step 3: Show the new post
  if (step === 3 && newPost) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Crown className="w-5 h-5 text-yellow-500" />
            Admin Content Published Successfully!
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <p className="text-green-800 font-medium">✅ Content is now live in the feed</p>
            <p className="text-green-700 text-sm mt-1">
              This admin content will be prominently displayed and has extended visibility.
            </p>
          </div>
          <PostCard post={newPost} />
          <Button
            onClick={resetForm}
            className="w-full bg-purple-600 hover:bg-purple-700"
          >
            Upload Another Post
          </Button>
        </CardContent>
      </Card>
    );
  }

  // Step 2: Preview & details
  if (step === 2 && selectedFile) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="w-5 h-5" />
            Preview Admin Content
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Crown className="w-4 h-4 text-yellow-600" />
              <span className="font-medium text-yellow-800">Admin Content</span>
            </div>
            <p className="text-yellow-700 text-sm">
              This content will be automatically approved and promoted in the feed with extended visibility.
            </p>
          </div>
          
          <div className="border rounded-lg overflow-hidden">
            {selectedFile.type.startsWith('image/') && previewUrl && (
              <img
                src={previewUrl}
                alt="Preview"
                className="w-full max-h-64 object-contain"
              />
            )}
            {selectedFile.type.startsWith('video/') && previewUrl && (
              <video
                src={previewUrl}
                controls
                className="w-full max-h-64 object-contain"
              />
            )}
          </div>

          <CaptionSection
            caption={caption}
            onCaptionChange={setCaption}
          />

          <div className="flex space-x-2">
            <Button
              onClick={handleUpload}
              disabled={uploading}
              className="flex-1 bg-green-600 hover:bg-green-700"
            >
              {uploading ? (
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Publishing...</span>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <Crown className="w-4 h-4" />
                  <span>Publish Admin Content</span>
                </div>
              )}
            </Button>
            <Button
              variant="outline"
              onClick={resetForm}
              disabled={uploading}
            >
              Cancel
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Step 1: Select file
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="w-5 h-5" />
          Admin Content Upload
        </CardTitle>
        <p className="text-sm text-gray-600">
          Upload content that will be automatically approved and promoted in the feed.
        </p>
      </CardHeader>
      <CardContent>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <h4 className="font-medium text-blue-900 mb-2">Admin Content Features</h4>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• Automatically approved and promoted</li>
            <li>• Extended visibility (30 days)</li>
            <li>• Priority placement in feed</li>
            <li>• Instant publication</li>
          </ul>
        </div>
        <FileUploadSection
          selectedFile={selectedFile}
          onFileChange={handleFileChange}
        />
      </CardContent>
    </Card>
  );
};

export default UnifiedContentUpload;
