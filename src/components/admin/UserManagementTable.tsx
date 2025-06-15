
import React from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import UserStatusBadges from "./UserStatusBadges";
import UserActionsMenu from "./UserActionsMenu";
import type { UserOverview } from "./UserManagement";

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

/**
 * Responsive user management table with scroll and compact styles
 */
const UserManagementTable: React.FC<{
  users: UserOverview[];
  removingContentUserId: string | null;
  onBlockUser: (userId: string, isBlocked: boolean) => void;
  onRemoveContent: (userId: string) => void;
}> = ({
  users,
  removingContentUserId,
  onBlockUser,
  onRemoveContent,
}) => (
  <div className="overflow-x-auto w-full min-w-[600px]">
    <Table className="min-w-[720px] w-full text-[13px]">
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
                <div className="font-medium text-white truncate max-w-[120px] md:max-w-none">{user.display_name || "No name"}</div>
                <div className="text-xs text-gray-400 truncate max-w-[160px] md:max-w-none">{user.email}</div>
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
              <div className="text-xs text-gray-300">
                <div>Swipes: {user.total_swipes}</div>
                <div>Matches: {user.total_matches}</div>
                <div>Posts: {user.total_posts}</div>
              </div>
            </TableCell>
            <TableCell>
              <div className="text-xs text-gray-300 text-nowrap">
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
  </div>
);

export default UserManagementTable;
