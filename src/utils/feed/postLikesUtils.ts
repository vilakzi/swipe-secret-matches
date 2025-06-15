
import { supabase } from "@/integrations/supabase/client";

/**
 * Fetch liked user ids for a post
 */
export async function fetchPostLikedUserIDs(postId: string): Promise<string[]> {
  const { data, error } = await supabase
    .from("post_likes")
    .select("user_id")
    .eq("post_id", postId.replace('post-', ''));
  if (error) {
    console.error("Failed to fetch likes", error);
    return [];
  }
  return data?.map((item: { user_id: string }) => item.user_id) || [];
}

/**
 * Like a post for a user
 */
export async function likePost(postId: string, userId: string): Promise<boolean> {
  const { error } = await supabase.from("post_likes").insert({
    post_id: postId.replace('post-', ''),
    user_id: userId
  });
  if (error) {
    console.error("Failed to like post", error);
    return false;
  }
  return true;
}

/**
 * Unlike a post by removing like entry
 */
export async function unlikePost(postId: string, userId: string): Promise<boolean> {
  const { error } = await supabase.from("post_likes")
    .delete()
    .eq("post_id", postId.replace('post-', ''))
    .eq("user_id", userId);

  if (error) {
    console.error("Failed to unlike post", error);
    return false;
  }
  return true;
}

/**
 * Check if a user liked a post
 */
export function isPostLikedByUser(postLikedUserIDs: string[], userId: string) {
  return postLikedUserIDs.includes(userId);
}
