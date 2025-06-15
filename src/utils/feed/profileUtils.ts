
export const PLACEHOLDER_IMAGE = "/placeholder.svg";

export function isProfileImageChanged(imageUrl?: string): boolean {
  return !!imageUrl && imageUrl !== PLACEHOLDER_IMAGE;
}
