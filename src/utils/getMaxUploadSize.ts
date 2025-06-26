
import { UserRole } from "@/hooks/useUserRole";

// Returns max file size in bytes based on user role
export function getMaxUploadSize(role: UserRole): number {
  if (role === "admin") return 59 * 1024 * 1024;      // 59MB for admin
  if (role === "service_provider") return 59 * 1024 * 1024; // 59MB for providers
  return 10 * 1024 * 1024;                            // 10MB for regular users
}
