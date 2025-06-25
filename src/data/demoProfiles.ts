
import { Profile } from '@/components/feed/types/feedTypes';

// COMPLETELY REMOVED - Platform uses only real accounts from database
// NO DEMO PROFILES ALLOWED
export const demoProfiles: Profile[] = [];

console.log('Demo profiles array is empty - using only real database accounts');

// Re-export the Profile type
export type { Profile } from '@/components/feed/types/feedTypes';
