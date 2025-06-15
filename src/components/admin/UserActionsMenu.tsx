
import React from "react";
import { Button } from "@/components/ui/button";
import { Ban, UserCheck, Trash2, Loader2 } from "lucide-react";
import { UserOverview } from "./UserManagement";

interface Props {
  user: UserOverview;
  removingContentUserId: string | null;
  onBlockUser: (userId: string, isBlocked: boolean) => void;
  onRemoveContent: (userId: string) => void;
}

/// Button row with compact layout
const UserActionsMenu: React.FC<Props> = ({
  user,
  removingContentUserId,
  onBlockUser,
  onRemoveContent,
}) => (
  <div className="flex space-x-1 sm:space-x-2">
    <Button
      size="sm"
      variant={user.is_blocked ? "default" : "destructive"}
      onClick={() => onBlockUser(user.id, user.is_blocked)}
      className="px-2 py-1"
      aria-label={user.is_blocked ? "Unblock User" : "Block User"}
    >
      {user.is_blocked ? (
        <>
          <UserCheck className="w-3 h-3 mr-1" />
          <span className="hidden sm:inline">Unblock</span>
        </>
      ) : (
        <>
          <Ban className="w-3 h-3 mr-1" />
          <span className="hidden sm:inline">Block</span>
        </>
      )}
    </Button>
    <Button
      size="sm"
      variant="outline"
      onClick={() => onRemoveContent(user.id)}
      disabled={removingContentUserId === user.id}
      className="flex items-center px-2 py-1"
      aria-label={`Remove all content posted by ${user.display_name || user.email}`}
    >
      {removingContentUserId === user.id ? (
        <>
          <Loader2 className="w-3 h-3 mr-1 animate-spin" />
          <span className="hidden sm:inline">Removing...</span>
        </>
      ) : (
        <>
          <Trash2 className="w-3 h-3 mr-1" />
          <span className="hidden sm:inline">Remove Content</span>
        </>
      )}
    </Button>
  </div>
);

export default UserActionsMenu;
