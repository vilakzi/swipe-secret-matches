
import React from 'react';
import { Card } from '@/components/ui/card';
import PostCard from '../PostCard';

interface UploadSuccessProps {
  post: any;
  onReset: () => void;
}

const UploadSuccess = ({ post, onReset }: UploadSuccessProps) => {
  return (
    <Card className="bg-black/20 backdrop-blur-md border-gray-700 p-6 mb-8">
      <h2 className="text-xl font-bold text-white mb-4">Your Post is Live!</h2>
      <PostCard post={post} />
      <button
        className="mt-6 px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
        onClick={onReset}
      >
        Post another
      </button>
    </Card>
  );
};

export default UploadSuccess;
