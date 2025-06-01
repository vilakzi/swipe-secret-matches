
import React, { useState } from 'react';
import { MessageCircle, Send, ArrowLeft, MoreVertical } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useMessages } from '@/hooks/useMessages';
import { useNavigate, useParams } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';

const Messages = () => {
  const navigate = useNavigate();
  const { userId } = useParams();
  const [newMessage, setNewMessage] = useState('');
  
  const { messages, conversations, loading, sendMessage } = useMessages(userId);

  const handleSendMessage = async () => {
    if (!userId || !newMessage.trim()) return;
    
    await sendMessage(userId, newMessage.trim());
    setNewMessage('');
  };

  // Conversation view
  if (userId) {
    const conversation = conversations.find(c => c.user.id === userId);
    
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-purple-900 text-white">
        <div className="max-w-md mx-auto">
          {/* Header */}
          <div className="bg-black/20 backdrop-blur-md border-b border-gray-700 p-4">
            <div className="flex items-center space-x-3">
              <Button
                size="sm"
                variant="ghost"
                onClick={() => navigate('/messages')}
                className="text-white hover:bg-white/10"
              >
                <ArrowLeft className="w-4 h-4" />
              </Button>
              
              <div className="flex items-center space-x-3 flex-1">
                <div className="w-10 h-10 rounded-full overflow-hidden">
                  <img
                    src={conversation?.user.profile_image_url || '/placeholder.svg'}
                    alt={conversation?.user.display_name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <h2 className="font-semibold">{conversation?.user.display_name}</h2>
                  <p className="text-xs text-gray-400">Active now</p>
                </div>
              </div>
              
              <Button
                size="sm"
                variant="ghost"
                className="text-white hover:bg-white/10"
              >
                <MoreVertical className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 p-4 space-y-4 max-h-[calc(100vh-200px)] overflow-y-auto">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.sender_id === userId ? 'justify-start' : 'justify-end'}`}
              >
                <div
                  className={`max-w-xs px-4 py-2 rounded-2xl ${
                    message.sender_id === userId
                      ? 'bg-gray-700 text-white'
                      : 'bg-purple-600 text-white'
                  }`}
                >
                  <p className="text-sm">{message.content}</p>
                  <p className="text-xs opacity-70 mt-1">
                    {formatDistanceToNow(new Date(message.created_at), { addSuffix: true })}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Message Input */}
          <div className="p-4 bg-black/20 backdrop-blur-md border-t border-gray-700">
            <div className="flex space-x-2">
              <Input
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type a message..."
                className="flex-1 bg-gray-800 border-gray-600 text-white"
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              />
              <Button
                onClick={handleSendMessage}
                disabled={!newMessage.trim()}
                className="bg-purple-600 hover:bg-purple-700"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Conversations list view
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-purple-900 text-white pb-20">
      <div className="max-w-md mx-auto p-4">
        <div className="pt-4 pb-6">
          <h1 className="text-2xl font-bold text-center">Messages</h1>
          <p className="text-gray-400 text-center mt-2">Chat with your connections</p>
        </div>

        <div className="space-y-4">
          {conversations.length === 0 ? (
            <Card className="bg-gray-800/50 border-gray-700">
              <CardContent className="p-8 text-center">
                <MessageCircle className="w-16 h-16 text-purple-500 mx-auto mb-4 opacity-50" />
                <h3 className="text-lg font-semibold mb-2">No conversations yet</h3>
                <p className="text-gray-400 mb-4">
                  Match with someone to start chatting!
                </p>
                <Button 
                  onClick={() => navigate('/matches')}
                  className="bg-purple-600 hover:bg-purple-700"
                >
                  View Matches
                </Button>
              </CardContent>
            </Card>
          ) : (
            conversations.map((conversation) => (
              <Card 
                key={conversation.user.id} 
                className="bg-gray-800/50 border-gray-700 hover:bg-gray-800/70 transition-colors cursor-pointer"
                onClick={() => navigate(`/messages/${conversation.user.id}`)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center space-x-4">
                    <div className="relative">
                      <div className="w-14 h-14 rounded-full overflow-hidden">
                        <img
                          src={conversation.user.profile_image_url || '/placeholder.svg'}
                          alt={conversation.user.display_name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      {conversation.unreadCount > 0 && (
                        <div className="absolute -top-1 -right-1 w-5 h-5 bg-purple-600 rounded-full flex items-center justify-center">
                          <span className="text-xs text-white font-bold">
                            {conversation.unreadCount}
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="font-semibold text-white truncate">
                          {conversation.user.display_name}
                        </h3>
                        <span className="text-xs text-gray-400">
                          {formatDistanceToNow(new Date(conversation.lastMessage.created_at), { addSuffix: true })}
                        </span>
                      </div>
                      
                      <p className="text-gray-400 text-sm truncate">
                        {conversation.lastMessage.content}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Messages;
