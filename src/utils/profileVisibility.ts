
export type RelationshipStatus = "approved" | "not-followed";

/**
 * Determines if a profile is viewable by the viewer given the profile's visibility and relationship.
 *
 * @param profileVisibility - "public" or "private"
 * @param viewerRelationship - e.g. "approved" or "not-followed"
 * @returns true if profile should be viewable
 */
export function canViewProfile(
  profileVisibility: "public" | "private",
  viewerRelationship: RelationshipStatus
): boolean {
  if (profileVisibility === "public") return true;
  return viewerRelationship === "approved";
}
