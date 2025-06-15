
export interface Profile {
  id: string;
  name: string;
  age: number;
  image: string;
  bio: string;
  whatsapp: string;
  location: string;
  gender?: 'male' | 'female';
  userType?: 'user' | 'service_provider' | 'admin' | 'superadmin';
  serviceCategory?: string;
  portfolio?: string[];
  rating?: number;
  reviewCount?: number;
  isAvailable?: boolean;
  services?: string[];
  liked?: boolean;
  posts?: string[];
  isRealAccount?: boolean;
  joinDate?: string;
  role?: string;
}

export interface FeedItem {
  id: string;
  type: 'profile' | 'post';
  profile: Profile;
  postImage?: string;
  caption?: string;
  isWelcome?: boolean;
}
