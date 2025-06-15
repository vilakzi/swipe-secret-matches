
import React from "react";
import { Button } from "@/components/ui/button";
import { Ban, UserCheck, Trash2, Loader2 } from "lucide-react";
import { UserOverview } from "./UserManagementTable";

interface Props {
  user: UserOverview;
  removingContentUserId: string | null;
  onBlockUser: (userId: string, isBlocked: boolean) => void;
  onRemoveContent: (userId: string) => void;
}

const UserActionsMenu: React.FC<Props> = ({
  user,
  removingContentUserId,
  onBlockUser,
  onRemoveContent,
}) => (
  <div className="flex space-x-2">
    <Button
      size="sm"
      variant={user.is_blocked ? "default" : "destructive"}
      onClick={() => onBlockUser(user.id, user.is_blocked)}
    >
      {user.is_blocked ? (
        <>
          <UserCheck className="w-3 h-3 mr-1" />
          Unblock
        </>
      ) : (
        <>
          <Ban className="w-3 h-3 mr-1" />
          Block
        </>
      )}
    </Button>
    <Button
      size="sm"
      variant="outline"
      onClick={() => onRemoveContent(user.id)}
      disabled={removingContentUserId === user.id}
      className="flex items-center"
      aria-label={`Remove all content posted by ${user.display_name || user.email}`}
    >
      {removingContentUserId === user.id ? (
        <>
          <Loader2 className="w-3 h-3 mr-1 animate-spin" />
          Removing...
        </>
      ) : (
        <>
          <Trash2 className="w-3 h-3 mr-1" />
          Remove Content
        </>
      )}
    </Button>
  </div>
);

export default UserActionsMenu;
