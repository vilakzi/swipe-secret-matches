
import React, { useState } from "react";
import PostComments from "./PostComments";

interface PostCardCommentsSectionProps {
  postId: string;
}

const PostCardCommentsSection = ({ postId }: PostCardCommentsSectionProps) => {
  const [showComments, setShowComments] = useState(false);

  return (
    <>
      <PostComments
        postId={postId}
        isOpen={showComments}
        onToggle={() => setShowComments((open) => !open)}
      />
      {showComments && (
        <PostComments
          postId={postId}
          isOpen={showComments}
          onToggle={() => setShowComments((open) => !open)}
        />
      )}
    </>
  );
};

export default PostCardCommentsSection;
