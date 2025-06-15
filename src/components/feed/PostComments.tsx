
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { MessageCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';
import CommentForm from './CommentForm';
import CommentList from './CommentList';

interface Comment {
  id: string;
  content: string;
  created_at: string;
  user_id: string;
  user_profile?: {
    display_name: string;
    profile_image_url: string;
  };
}

interface PostCommentsProps {
  postId: string;
  isOpen: boolean;
  onToggle: () => void;
}

const PostComments = ({ postId, isOpen, onToggle }: PostCommentsProps) => {
  const { user } = useAuth();
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchComments();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, postId]);

  const fetchComments = async () => {
    setLoading(true);
    try {
      const { data: commentsData, error: commentsError } = await supabase
        .from('post_comments')
        .select('id, content, created_at, user_id')
        .eq('post_id', postId.replace('post-', ''))
        .order('created_at', { ascending: true });

      if (commentsError) throw commentsError;

      if (commentsData && commentsData.length > 0) {
        const userIds = [...new Set(commentsData.map(comment => comment.user_id))];

        const { data: profilesData, error: profilesError } = await supabase
          .from('profiles')
          .select('id, display_name, profile_image_url')
          .in('id', userIds);

        if (profilesError) {
          console.error('Error fetching profiles:', profilesError);
        }

        const commentsWithProfiles = commentsData.map(comment => ({
          ...comment,
          user_profile: profilesData?.find(profile => profile.id === comment.user_id) || {
            display_name: 'Anonymous',
            profile_image_url: '/placeholder.svg'
          }
        }));

        setComments(commentsWithProfiles);
      } else {
        setComments([]);
      }
    } catch (error: any) {
      console.error('Error fetching comments:', error);
      setComments([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !user) return;

    setSubmitting(true);
    try {
      const { data, error } = await supabase
        .from('post_comments')
        .insert({
          post_id: postId.replace('post-', ''),
          user_id: user.id,
          content: newComment.trim()
        })
        .select('id, content, created_at, user_id')
        .single();

      if (error) throw error;

      const { data: userProfile } = await supabase
        .from('profiles')
        .select('display_name, profile_image_url')
        .eq('id', user.id)
        .single();

      const newCommentWithProfile = {
        ...data,
        user_profile: userProfile || {
          display_name: 'Anonymous',
          profile_image_url: '/placeholder.svg'
        }
      };

      setComments(prev => [...prev, newCommentWithProfile]);
      setNewComment('');

      toast({
        title: "Comment posted!",
        description: "Your comment has been added.",
      });
    } catch (error: any) {
      toast({
        title: "Failed to post comment",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) {
    return (
      <Button
        variant="ghost"
        size="sm"
        className="text-white p-0"
        onClick={onToggle}
      >
        <MessageCircle className="w-6 h-6" />
        {comments.length > 0 && (
          <span className="ml-1 text-sm">{comments.length}</span>
        )}
      </Button>
    );
  }

  return (
    <div className="mt-4 border-t border-gray-700 pt-4">
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-white font-medium">Comments</h4>
        <Button
          variant="ghost"
          size="sm"
          onClick={onToggle}
          className="text-gray-400"
        >
          Close
        </Button>
      </div>

      {loading ? (
        <div className="text-center py-4">
          <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto" />
        </div>
      ) : (
        <div className="space-y-3 max-h-40 overflow-y-auto mb-4">
          <CommentList comments={comments as any[]} />
        </div>
      )}

      {user && (
        <CommentForm
          value={newComment}
          onChange={e => setNewComment(e.target.value)}
          onSubmit={handleSubmit}
          disabled={submitting}
          submitting={submitting}
        />
      )}
    </div>
  );
};

export default PostComments;
