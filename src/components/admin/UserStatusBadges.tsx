import React from "react";
import { Badge } from "@/components/ui/badge";
import { Ban, UserCheck } from "lucide-react";
import { UserOverview } from "./UserManagement";

const UserStatusBadges: React.FC<{ user: UserOverview }> = ({ user }) => (
  <div className="flex flex-col space-y-1">
    {user.is_blocked && (
      <Badge className="bg-red-600 text-white">
        <Ban className="w-3 h-3 mr-1" />
        <span className="hidden sm:inline">Blocked</span>
      </Badge>
    )}
    {user.subscribed && (
      <Badge className="bg-green-600 text-white">
        <UserCheck className="w-3 h-3 mr-1" />
        <span className="hidden sm:inline">Subscribed</span>
      </Badge>
    )}
  </div>
);

export default UserStatusBadges;
