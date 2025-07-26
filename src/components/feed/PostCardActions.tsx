
import { Button } from "@/components/ui/button";
import { Heart, Share } from "lucide-react";
import PostComments from "./PostComments";
import React, { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { fetchPostLikedUserIDs, likePost, unlikePost, isPostLikedByUser } from "@/utils/feed/postLikesUtils";
import { toast } from "@/hooks/use-toast";

interface PostCardActionsProps {
  itemId: string;
  showComments: boolean;
  onToggleComments: () => void;
  onContact?: (e: React.MouseEvent) => void; // Make optional since we're removing dating features
  isSubscribed: boolean;
}

const PostCardActions = ({
  itemId,
  showComments,
  onToggleComments,
  onContact, // Keep but won't use for Instagram-style feed
  isSubscribed,
}: PostCardActionsProps) => {
  const { user } = useAuth();
  const [likedUserIDs, setLikedUserIDs] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    if (user) {
      fetchPostLikedUserIDs(itemId).then(setLikedUserIDs);
    }
    // eslint-disable-next-line
  }, [itemId, user]);

  const liked = user ? isPostLikedByUser(likedUserIDs, user.id) : false;

  const handleLike = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user) {
      toast({ title: "Login required", description: "You need to log in to like posts", variant: "destructive" });
      return;
    }
    setLoading(true);
    if (liked) {
      const ok = await unlikePost(itemId, user.id);
      if (ok) {
        setLikedUserIDs(likedUserIDs.filter(id => id !== user.id));
        toast({ title: "Like removed", description: "You unliked this post." });
      }
    } else {
      const ok = await likePost(itemId, user.id);
      if (ok) {
        setLikedUserIDs([...likedUserIDs, user.id]);
        toast({ title: "Profile liked!", description: "Your like has been sent!" });
      }
    }
    setLoading(false);
  };

  return (
    <div className="flex items-center space-x-4 mb-3">
      <Button
        variant="ghost"
        size="sm"
        className={`p-0 ${liked ? "text-red-500" : "text-white"}`}
        onClick={handleLike}
        disabled={loading}
      >
        <Heart className={`w-6 h-6 ${liked ? "fill-current" : ""}`} />
        <span className="ml-2 text-sm">{likedUserIDs.length}</span>
      </Button>
      <PostComments
        postId={itemId}
        isOpen={showComments}
        onToggle={onToggleComments}
      />
      <Button variant="ghost" size="sm" className="text-white p-0">
        <Share className="w-6 h-6" />
      </Button>
    </div>
  );
};

export default PostCardActions;
