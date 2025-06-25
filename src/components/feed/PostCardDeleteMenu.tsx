
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Trash2, MoreVertical } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

interface PostCardDeleteMenuProps {
  postId: string;
  profileId: string;
  onDelete?: (itemId: string) => void;
}

const PostCardDeleteMenu = ({ postId, profileId, onDelete }: PostCardDeleteMenuProps) => {
  const { user } = useAuth();
  const [isDeleting, setIsDeleting] = useState(false);

  const canDelete = user && user.id === profileId;

  const handleDeletePost = async () => {
    if (!user || user.id !== profileId) {
      toast({
        title: "Access denied",
        description: "You can only delete your own posts",
        variant: "destructive",
      });
      return;
    }

    setIsDeleting(true);
    try {
      const actualPostId = postId.startsWith('post-') ? postId.replace('post-', '') : postId;
      
      const { error } = await supabase
        .from('posts')
        .delete()
        .eq('id', actualPostId)
        .eq('provider_id', user.id);

      if (error) {
        console.error('Delete error:', error);
        toast({
          title: "Delete failed",
          description: "Could not delete the post. Please try again.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Post deleted",
          description: "Your post has been successfully deleted.",
        });
        if (onDelete) {
          onDelete(postId);
        }
      }
    } catch (error) {
      console.error('Delete error:', error);
      toast({
        title: "Delete failed", 
        description: "An error occurred while deleting the post.",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  if (!canDelete) {
    return null;
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="text-gray-400 hover:text-white h-10 w-10 p-0 touch-target"
        >
          <MoreVertical className="h-5 w-5" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="bg-gray-800 border-gray-700 z-50">
        <DropdownMenuItem
          onClick={handleDeletePost}
          disabled={isDeleting}
          className="text-red-400 hover:text-red-300 hover:bg-gray-700 cursor-pointer touch-target"
        >
          <Trash2 className="h-4 w-4 mr-2" />
          {isDeleting ? "Deleting..." : "Delete Post"}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default PostCardDeleteMenu;
