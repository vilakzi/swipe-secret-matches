
import React from 'react';
import { MessageCircle, Send } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

const Messages = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-purple-900 text-white pb-20">
      <div className="max-w-md mx-auto p-4">
        <div className="pt-4 pb-6">
          <h1 className="text-2xl font-bold text-center">Messages</h1>
          <p className="text-gray-400 text-center mt-2">Chat with your connections</p>
        </div>

        <div className="space-y-4">
          {/* Placeholder for when no messages */}
          <Card className="bg-gray-800/50 border-gray-700">
            <CardContent className="p-8 text-center">
              <MessageCircle className="w-16 h-16 text-purple-500 mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-semibold mb-2">No conversations yet</h3>
              <p className="text-gray-400 mb-4">
                Match with someone to start chatting!
              </p>
              <div className="flex justify-center">
                <Send className="w-8 h-8 text-purple-400 opacity-30" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Messages;
