
import * as React from 'react';

interface CommentItemProps {
  comment: {
    id: string;
    content: string;
    created_at: string;
    user_profile: {
      display_name: string;
      profile_image_url: string;
    };
  };
}

const CommentItem = ({ comment }: CommentItemProps) => (
  <div className="flex space-x-2" key={comment.id}>
    <img
      src={comment.user_profile?.profile_image_url || '/placeholder.svg'}
      alt="User"
      className="w-6 h-6 rounded-full object-cover"
    />
    <div className="flex-1">
      <div className="bg-gray-700 rounded-lg px-3 py-2">
        <p className="text-white text-sm font-medium">
          {comment.user_profile?.display_name || 'Anonymous'}
        </p>
        <p className="text-gray-300 text-sm">{comment.content}</p>
      </div>
      <p className="text-gray-500 text-xs mt-1">
        {new Date(comment.created_at).toLocaleTimeString()}
      </p>
    </div>
  </div>
);

export default CommentItem;
