
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
  // Verification properties
  verifications?: {
    phoneVerified: boolean;
    emailVerified: boolean;
    photoVerified: boolean;
    locationVerified: boolean;
    premiumUser: boolean;
  };
}

export interface FeedItem {
  id: string;
  type: "profile" | "post";
  profile: Profile;
  postImage?: string;
  caption?: string;
  isAdminCard?: boolean;
  isAdminPost?: boolean;
  isWelcome?: boolean;
  // Video-specific properties
  isVideo?: boolean;
  videoDuration?: number;
  videoThumbnail?: string;
  // Post metadata
  createdAt?: string;
  updatedAt?: string;
  // Algorithm properties
  algorithmScore?: number;
  originalIndex?: number;
}

export type RelationshipStatus = 'single' | 'taken' | 'complicated' | 'not_specified';
