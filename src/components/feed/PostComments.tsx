
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Send, MessageCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';

interface Comment {
  id: string;
  content: string;
  created_at: string;
  user_id: string;
  profiles?: {
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
  }, [isOpen, postId]);

  const fetchComments = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('post_comments')
        .select(`
          id,
          content,
          created_at,
          user_id,
          profiles!post_comments_user_id_fkey(
            display_name,
            profile_image_url
          )
        `)
        .eq('post_id', postId.replace('post-', ''))
        .order('created_at', { ascending: true });

      if (error) throw error;
      setComments(data || []);
    } catch (error: any) {
      console.error('Error fetching comments:', error);
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
        .select(`
          id,
          content,
          created_at,
          user_id,
          profiles!post_comments_user_id_fkey(
            display_name,
            profile_image_url
          )
        `)
        .single();

      if (error) throw error;

      setComments(prev => [...prev, data]);
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
          {comments.length === 0 ? (
            <p className="text-gray-400 text-sm">No comments yet. Be the first to comment!</p>
          ) : (
            comments.map((comment) => (
              <div key={comment.id} className="flex space-x-2">
                <img
                  src={comment.profiles?.profile_image_url || '/placeholder.svg'}
                  alt="User"
                  className="w-6 h-6 rounded-full"
                />
                <div className="flex-1">
                  <div className="bg-gray-700 rounded-lg px-3 py-2">
                    <p className="text-white text-sm font-medium">
                      {comment.profiles?.display_name || 'Anonymous'}
                    </p>
                    <p className="text-gray-300 text-sm">{comment.content}</p>
                  </div>
                  <p className="text-gray-500 text-xs mt-1">
                    {new Date(comment.created_at).toLocaleTimeString()}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {user && (
        <form onSubmit={handleSubmit} className="flex space-x-2">
          <Input
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Write a comment..."
            className="flex-1 bg-gray-700 border-gray-600 text-white"
            disabled={submitting}
          />
          <Button
            type="submit"
            size="sm"
            disabled={!newComment.trim() || submitting}
            className="bg-purple-600 hover:bg-purple-700"
          >
            {submitting ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </Button>
        </form>
      )}
    </div>
  );
};

export default PostComments;
