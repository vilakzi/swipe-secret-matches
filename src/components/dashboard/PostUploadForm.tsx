
import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import EnhancedFileUploadSection from './upload/EnhancedFileUploadSection';
import CaptionSection from './upload/CaptionSection';
import PromotionTypeSelector from './upload/PromotionTypeSelector';
import PostPreview from './upload/PostPreview';
import PostFormActions from './upload/PostFormActions';
import MobileUploadProgress from './upload/MobileUploadProgress';
import UploadSuccess from './upload/UploadSuccess';
import { usePostUpload } from './upload/usePostUpload';

interface PostUploadFormProps {
  onUploadSuccess: () => void;
  onShowPayment: (post: any) => void;
  onAddPostToFeed: (post: any) => void;
}

type PromotionType = 'free_2h' | 'paid_8h' | 'paid_12h';
type Step = 1 | 2 | 3;

const PostUploadForm = ({ onUploadSuccess, onShowPayment, onAddPostToFeed }: PostUploadFormProps) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [caption, setCaption] = useState('');
  const [promotionType, setPromotionType] = useState<PromotionType>('free_2h');
  const [step, setStep] = useState<Step>(1);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [newPost, setNewPost] = useState<any>(null);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [isValidating, setIsValidating] = useState(false);

  const { uploading, uploadProgress, uploadPost, uploadError } = usePostUpload();

  const resetForm = () => {
    setSelectedFile(null);
    setCaption('');
    setPromotionType('free_2h');
    setPreviewUrl(null);
    setNewPost(null);
    setStep(1);
    setValidationError(null);
    setIsValidating(false);
  };

  const handleFileChange = (file: File | null) => {
    setSelectedFile(file);
    setCaption('');
    setPromotionType('free_2h');
    setNewPost(null);
    setValidationError(null);
    setIsValidating(false);
    
    if (file) {
      setPreviewUrl(URL.createObjectURL(file));
      setStep(2);
    } else {
      setPreviewUrl(null);
      setStep(1);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    const result = await uploadPost(
      selectedFile,
      caption,
      promotionType,
      validationError,
      onUploadSuccess,
      onAddPostToFeed,
      onShowPayment
    );

    if (result) {
      setNewPost(result);
      setStep(3);
      setSelectedFile(null);
      setCaption('');
      setPreviewUrl(null);
    }
  };

  // Step 3: Show the new post
  if (step === 3 && newPost) {
    return <UploadSuccess post={newPost} onReset={resetForm} />;
  }

  // Step 2: Preview & details
  if (step === 2 && selectedFile) {
    return (
      <Card className="bg-black/20 backdrop-blur-md border-gray-700 p-6 mb-8">
        <h2 className="text-xl font-bold text-white mb-4">Preview Your Post</h2>
        
        <MobileUploadProgress
          progress={uploadProgress}
          isUploading={uploading}
          error={uploadError}
          fileName={selectedFile.name}
        />

        <PostPreview file={selectedFile} previewUrl={previewUrl} />
        
        <CaptionSection
          caption={caption}
          onCaptionChange={setCaption}
        />
        <PromotionTypeSelector
          promotionType={promotionType}
          onPromotionTypeChange={setPromotionType}
        />
        
        <PostFormActions
          selectedFile={selectedFile}
          uploading={uploading}
          promotionType={promotionType}
          validationError={validationError || uploadError}
          isValidating={isValidating}
          onUpload={handleUpload}
          onCancel={resetForm}
        />
      </Card>
    );
  }

  // Step 1: Select file
  return (
    <Card className="bg-black/20 backdrop-blur-md border-gray-700 p-6 mb-8">
      <h2 className="text-xl font-bold text-white mb-4">Create New Post</h2>
      <EnhancedFileUploadSection
        selectedFile={selectedFile}
        onFileChange={handleFileChange}
        validationError={validationError}
        isValidating={isValidating}
        setValidationError={setValidationError}
        setIsValidating={setIsValidating}
        uploadError={uploadError}
      />
    </Card>
  );
};

export default PostUploadForm;
