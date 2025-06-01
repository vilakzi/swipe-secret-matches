
export interface ProfileData {
  display_name: string;
  age: number | null;
  bio: string;
  location: string;
  whatsapp: string;
  profile_image_url: string | null;
  profile_images: string[];
  interests: string[];
  privacySettings: {
    showOnlineStatus: boolean;
    showLastSeen: boolean;
    showLocation: boolean;
    showContact: boolean;
    allowMessages: boolean;
    profileVisibility: 'public' | 'friends' | 'private';
  };
  verifications: {
    emailVerified: boolean;
    phoneVerified: boolean;
    photoVerified: boolean;
    locationVerified: boolean;
    premiumUser: boolean;
  };
}
