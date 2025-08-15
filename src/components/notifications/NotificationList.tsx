import * as React from 'react';
import { Heart, MessageCircle, UserPlus, AtSign, Bell } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface Notification {
  id: string;
  actor_id: string;
  type: string;
  post_id?: string;
  comment_id?: string;
  is_read: boolean;
  created_at: string;
  profiles?: {
    username: string;
    full_name: string;
    avatar_url: string;
  };
}

interface NotificationListProps {
  notifications: Notification[];
}

export const NotificationList: React.FC<NotificationListProps> = ({ notifications }) => {
  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'like':
        return <Heart className="w-4 h-4 text-red-500" />;
      case 'comment':
        return <MessageCircle className="w-4 h-4 text-blue-500" />;
      case 'follow':
        return <UserPlus className="w-4 h-4 text-green-500" />;
      case 'mention':
        return <AtSign className="w-4 h-4 text-purple-500" />;
      default:
        return null;
    }
  };

  const getNotificationText = (notification: Notification) => {
    const username = notification.profiles?.username || 'Someone';
    
    switch (notification.type) {
      case 'like':
        return `${username} liked your post`;
      case 'comment':
        return `${username} commented on your post`;
      case 'follow':
        return `${username} started following you`;
      case 'mention':
        return `${username} mentioned you in a comment`;
      default:
        return 'New notification';
    }
  };

  if (notifications.length === 0) {
    return (
      <div className="p-4 text-center text-gray-400">
        <Bell className="w-8 h-8 mx-auto mb-2 opacity-50" />
        <p>No notifications yet</p>
      </div>
    );
  }

  return (
    <div className="max-h-96 overflow-y-auto">
      <div className="p-3 border-b border-gray-700">
        <h3 className="font-semibold text-white">Notifications</h3>
      </div>
      
      {notifications.map((notification) => (
        <div
          key={notification.id}
          className={`p-3 border-b border-gray-700 last:border-b-0 hover:bg-gray-800 transition-colors ${
            !notification.is_read ? 'bg-gray-800/50' : ''
          }`}
        >
          <div className="flex items-start space-x-3">
            <div className="w-8 h-8 rounded-full overflow-hidden bg-gray-600 flex-shrink-0">
              {notification.profiles?.avatar_url ? (
                <img
                  src={notification.profiles.avatar_url}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-purple-500 to-pink-500" />
              )}
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2">
                {getNotificationIcon(notification.type)}
                <p className="text-sm text-gray-300 truncate">
                  {getNotificationText(notification)}
                </p>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
              </p>
            </div>
            
            {!notification.is_read && (
              <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-2" />
            )}
          </div>
        </div>
      ))}
    </div>
  );
};