
import { UserRole } from "@/hooks/useUserRole";

// Returns max file size in bytes based on user role
export function getMaxUploadSize(role: UserRole): number {
  if (role === "admin") return 30 * 1024 * 1024;      // 30MB
  return 10 * 1024 * 1024;                            // 10MB for providers & users
}
