
import { supabase } from "@/integrations/supabase/client";

export interface AdminInfo {
  id: string;
  email: string;
  display_name: string;
}

export const getAdmins = async (): Promise<AdminInfo[]> => {
  // Join user_roles and profiles tables to get admin emails
  const { data, error } = await supabase
    .from("user_roles")
    .select("user_id, role, profiles:profiles(id, email, display_name)")
    .eq("role", "admin");

  if (error) {
    console.error("Error fetching admins:", error);
    return [];
  }

  // Map to desired shape
  return (data || [])
    .filter((row: any) => row?.profiles?.id)
    .map((row: any) => ({
      id: row.user_id,
      email: row.profiles.email as string,
      display_name: row.profiles.display_name as string || "N/A",
    }));
};
