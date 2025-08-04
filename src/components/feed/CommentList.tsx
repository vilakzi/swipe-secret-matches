
import * as React from 'react';
import CommentItem from './CommentItem';

interface Comment {
  id: string;
  content: string;
  created_at: string;
  user_profile: {
    display_name: string;
    profile_image_url: string;
  };
}

interface CommentListProps {
  comments: Comment[];
}

const CommentList = ({ comments }: CommentListProps) => {
  if (!comments.length) {
    return <p className="text-gray-400 text-sm">No comments yet. Be the first to comment!</p>;
  }
  return (
    <>
      {comments.map(comment => (
        <CommentItem key={comment.id} comment={comment} />
      ))}
    </>
  );
};

export default CommentList;
