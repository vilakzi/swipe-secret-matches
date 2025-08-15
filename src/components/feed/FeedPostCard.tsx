import PostCard from "./PostCard";
import { FeedItem, Profile } from "./types/feedTypes";

interface FeedPostCardProps {
  item: FeedItem;
  likedItems: Set<string>;
  isSubscribed: boolean;
  onLike: (itemId: string, profileId: string) => void;
  onContact?: (profile: Profile) => void;
}

const FeedPostCard = (props: FeedPostCardProps) => {
  // Convert FeedItem to PostCard compatible format
  const post = {
    id: props.item.id,
    user_id: props.item.profile.id,
    content_url: props.item.postImage || '',
    caption: props.item.caption || '',
    post_type: (props.item.isVideo ? 'video' : 'image') as 'image' | 'video',
    created_at: props.item.createdAt || new Date().toISOString(),
    likes_count: 0, // Will be managed by parent
    comments_count: 0, // Will be managed by parent
    profiles: {
      id: props.item.profile.id,
      username: props.item.profile.name,
      full_name: props.item.profile.name,
      avatar_url: props.item.profile.image,
    },
    likes: [], // Will be managed by parent
  };

  const handleLike = (postId: string, isLiked: boolean) => {
    props.onLike(postId, props.item.profile.id);
  };

  return (
    <PostCard
      post={post}
      currentUserId={undefined}
      onLike={handleLike}
      onContact={props.onContact}
    />
  );
};

export default FeedPostCard;