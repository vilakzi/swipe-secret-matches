
// Provider and Post types for use across the app

export interface ProviderData {
  id: string;
  display_name: string;
  bio: string;
  location: string;
  whatsapp: string;
  profile_image_url: string;
  profile_images: string[];
  serviceCategory?: string;
  services?: string[];
  rating?: number;
  reviewCount?: number;
  isAvailable?: boolean;
}

export interface ProviderPost {
  id: string;
  content_url: string;
  post_type: string;
  created_at: string;
  promotion_type: string;
}
