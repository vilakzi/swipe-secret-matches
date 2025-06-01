
import React from 'react';
import { Heart, MessageCircle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

const Matches = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-purple-900 text-white pb-20">
      <div className="max-w-md mx-auto p-4">
        <div className="pt-4 pb-6">
          <h1 className="text-2xl font-bold text-center">Your Matches</h1>
          <p className="text-gray-400 text-center mt-2">People who liked you back</p>
        </div>

        <div className="space-y-4">
          {/* Placeholder for when no matches */}
          <Card className="bg-gray-800/50 border-gray-700">
            <CardContent className="p-8 text-center">
              <Heart className="w-16 h-16 text-purple-500 mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-semibold mb-2">No matches yet</h3>
              <p className="text-gray-400 mb-4">
                Start swiping to find your perfect match!
              </p>
              <div className="flex justify-center space-x-2">
                <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Matches;
