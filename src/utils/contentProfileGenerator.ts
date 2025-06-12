
import { EnhancedAdminContent } from '@/hooks/useEnhancedAdminContent';

export interface ContentProfile {
  id: string;
  name: string;
  age: number;
  image: string;
  bio: string;
  whatsapp: string;
  location: string;
  gender?: 'male' | 'female';
  userType?: 'user' | 'service_provider';
  isRealAccount?: boolean;
  posts?: string[];
  contentType?: 'image' | 'video';
  timestamp?: string;
  likes?: number;
  shares?: number;
  viewCount?: number;
  category?: string;
  tags?: string[];
}

export interface ContentFeedItem {
  id: string;
  type: 'profile' | 'post';
  profile: ContentProfile;
  postImage?: string;
  caption?: string;
  contentType?: 'image' | 'video';
  timestamp: string;
  category?: string;
  tags?: string[];
  engagement: {
    likes: number;
    views: number;
    shares: number;
  };
}

export const generateContentProfileCard = (adminContent: EnhancedAdminContent): ContentFeedItem => {
  const contentProfile: ContentProfile = {
    id: `content-${adminContent.id}`,
    name: "Content",
    age: 0, // Not applicable for content profiles
    image: "/placeholder.svg", // Default content logo - could be customized per category
    bio: adminContent.description || "Official content",
    whatsapp: "", // Not applicable
    location: "Official",
    isRealAccount: true, // Always verified for admin content
    posts: [adminContent.file_url],
    contentType: adminContent.content_type as 'image' | 'video',
    timestamp: adminContent.created_at,
    likes: adminContent.like_count || 0,
    shares: adminContent.share_count || 0,
    viewCount: adminContent.view_count || 0,
    category: adminContent.category,
    tags: adminContent.tags || [],
  };

  const feedItem: ContentFeedItem = {
    id: adminContent.id,
    type: 'post',
    profile: contentProfile,
    postImage: adminContent.file_url,
    caption: adminContent.title,
    contentType: adminContent.content_type as 'image' | 'video',
    timestamp: adminContent.created_at,
    category: adminContent.category,
    tags: adminContent.tags || [],
    engagement: {
      likes: adminContent.like_count || 0,
      views: adminContent.view_count || 0,
      shares: adminContent.share_count || 0,
    }
  };

  return feedItem;
};

export const generateContentProfileCards = (adminContentList: EnhancedAdminContent[]): ContentFeedItem[] => {
  return adminContentList
    .filter(content => 
      content.status === 'published' && 
      content.visibility === 'public' &&
      content.approval_status === 'approved'
    )
    .map(generateContentProfileCard)
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
};
