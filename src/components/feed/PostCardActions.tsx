
import { Button } from "@/components/ui/button";
import { Heart, Share } from "lucide-react";
import PostComments from "./PostComments";

interface PostCardActionsProps {
  itemId: string;
  liked: boolean;
  onLike: (e: React.MouseEvent) => void;
  showComments: boolean;
  onToggleComments: () => void;
  onContact: (e: React.MouseEvent) => void;
  isSubscribed: boolean;
}

const PostCardActions = ({
  itemId,
  liked,
  onLike,
  showComments,
  onToggleComments,
  onContact,
  isSubscribed,
}: PostCardActionsProps) => (
  <div className="flex items-center justify-between mb-3">
    <div className="flex items-center space-x-4">
      <Button
        variant="ghost"
        size="sm"
        className={`p-0 ${liked ? "text-red-500" : "text-white"}`}
        onClick={onLike}
      >
        <Heart className={`w-6 h-6 ${liked ? "fill-current" : ""}`} />
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
    <Button
      variant="ghost"
      size="sm"
      className="text-white p-0"
      onClick={onContact}
    >
      Contact
    </Button>
  </div>
);

export default PostCardActions;
