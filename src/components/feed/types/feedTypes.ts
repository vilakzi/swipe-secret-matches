
export interface Profile {
  id: string;
  name: string;
  age: number;
  image: string;
  bio: string;
  whatsapp: string;
  location: string;
  gender?: "male" | "female";
  userType: "user" | "service_provider" | "admin" | "superadmin";
  role?: string;
  joinDate?: string;
  liked?: boolean;
  posts?: string[];
  isRealAccount?: boolean;
  // Provider-specific properties
  serviceCategory?: string;
  portfolio?: string[];
  rating?: number;
  reviewCount?: number;
  isAvailable?: boolean;
  services?: string[];
}

export interface FeedItem {
  id: string;
  type: "profile" | "post";
  profile: Profile;
  postImage?: string;
  caption?: string;
  isAdminCard?: boolean;
  isWelcome?: boolean;
}

export type RelationshipStatus = 'single' | 'taken' | 'complicated' | 'not_specified';
