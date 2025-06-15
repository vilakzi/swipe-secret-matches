
import React from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import UserStatusBadges from "./UserStatusBadges";
import UserActionsMenu from "./UserActionsMenu";

export interface UserOverview {
  id: string;
  display_name: string;
  email: string;
  user_type: string;
  role: string;
  created_at: string;
  last_active: string;
  is_blocked: boolean;
  subscribed: boolean;
  subscription_tier: string;
  total_swipes: number;
  total_matches: number;
  total_posts: number;
}

interface UserManagementTableProps {
  users: UserOverview[];
  removingContentUserId: string | null;
  onBlockUser: (userId: string, isBlocked: boolean) => void;
  onRemoveContent: (userId: string) => void;
}

function getUserTypeColor(userType: string) {
  switch (userType) {
    case "service_provider":
      return "bg-purple-600";
    case "admin":
      return "bg-red-600";
    default:
      return "bg-blue-600";
  }
}

const UserManagementTable: React.FC<UserManagementTableProps> = ({
  users,
  removingContentUserId,
  onBlockUser,
  onRemoveContent,
}) => {
  return (
    <Table>
      <TableHeader>
        <TableRow className="border-gray-700">
          <TableHead className="text-gray-300">User</TableHead>
          <TableHead className="text-gray-300">Type</TableHead>
          <TableHead className="text-gray-300">Status</TableHead>
          <TableHead className="text-gray-300">Activity</TableHead>
          <TableHead className="text-gray-300">Last Active</TableHead>
          <TableHead className="text-gray-300">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {users.map(user => (
          <TableRow key={user.id} className="border-gray-700">
            <TableCell>
              <div>
                <div className="font-medium text-white">{user.display_name || "No name"}</div>
                <div className="text-sm text-gray-400">{user.email}</div>
              </div>
            </TableCell>
            <TableCell>
              <Badge className={`${getUserTypeColor(user.user_type)} text-white`}>
                {user.user_type}
              </Badge>
            </TableCell>
            <TableCell>
              <UserStatusBadges user={user} />
            </TableCell>
            <TableCell>
              <div className="text-sm text-gray-300">
                <div>Swipes: {user.total_swipes}</div>
                <div>Matches: {user.total_matches}</div>
                <div>Posts: {user.total_posts}</div>
              </div>
            </TableCell>
            <TableCell>
              <div className="text-sm text-gray-300">
                {user.last_active
                  ? new Date(user.last_active).toLocaleDateString()
                  : "Never"}
              </div>
            </TableCell>
            <TableCell>
              <UserActionsMenu
                user={user}
                removingContentUserId={removingContentUserId}
                onBlockUser={onBlockUser}
                onRemoveContent={onRemoveContent}
              />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

export default UserManagementTable;

