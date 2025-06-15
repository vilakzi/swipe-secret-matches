
import { differenceInMinutes } from "date-fns";

export const PLACEHOLDER_IMAGE = "/placeholder.svg";

export function isValidMedia(url?: string) {
  if (!url) return false;
  const ext = url.split('.').pop()?.toLowerCase();
  return ['jpg', 'jpeg', 'png', 'webp', 'gif', 'mp4', 'mov', 'webm'].includes(ext ?? '');
}

export function isProfileImageChanged(imageUrl: string): boolean {
  return !!imageUrl && imageUrl !== PLACEHOLDER_IMAGE;
}

export function isNewJoiner(joinDate?: string) {
  if (!joinDate) return false;
  const diff = differenceInMinutes(new Date(), new Date(joinDate));
  return diff <= 60;
}
