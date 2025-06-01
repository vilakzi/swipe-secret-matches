
import React, { useState } from 'react';
import { Heart, MessageCircle, MoreVertical, Clock } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useMatches } from '@/hooks/useMatches';
import { useNavigate } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';

const Matches = () => {
  const { matches, loading } = useMatches();
  const navigate = useNavigate();

  const handleMessage = (matchUserId: string) => {
    navigate(`/messages/${matchUserId}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-purple-900 text-white pb-20">
        <div className="max-w-md mx-auto p-4">
          <div className="pt-4 pb-6">
            <h1 className="text-2xl font-bold text-center">Your Matches</h1>
          </div>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="bg-gray-800/50 border-gray-700 animate-pulse">
                <CardContent className="p-4">
                  <div className="flex items-center space-x-4">
                    <div className="w-16 h-16 bg-gray-700 rounded-full"></div>
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-gray-700 rounded w-3/4"></div>
                      <div className="h-3 bg-gray-700 rounded w-1/2"></div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-purple-900 text-white pb-20">
      <div className="max-w-md mx-auto p-4">
        <div className="pt-4 pb-6">
          <h1 className="text-2xl font-bold text-center">Your Matches</h1>
          <p className="text-gray-400 text-center mt-2">
            {matches.length} {matches.length === 1 ? 'match' : 'matches'}
          </p>
        </div>

        <div className="space-y-4">
          {matches.length === 0 ? (
            <Card className="bg-gray-800/50 border-gray-700">
              <CardContent className="p-8 text-center">
                <Heart className="w-16 h-16 text-purple-500 mx-auto mb-4 opacity-50" />
                <h3 className="text-lg font-semibold mb-2">No matches yet</h3>
                <p className="text-gray-400 mb-4">
                  Start swiping to find your perfect match!
                </p>
                <Button 
                  onClick={() => navigate('/')}
                  className="bg-purple-600 hover:bg-purple-700"
                >
                  Start Swiping
                </Button>
              </CardContent>
            </Card>
          ) : (
            matches.map((match) => (
              <Card key={match.id} className="bg-gray-800/50 border-gray-700 hover:bg-gray-800/70 transition-colors">
                <CardContent className="p-4">
                  <div className="flex items-center space-x-4">
                    <div className="relative">
                      <div className="w-16 h-16 rounded-full overflow-hidden">
                        <img
                          src={match.profile?.profile_image_url || '/placeholder.svg'}
                          alt={match.profile?.display_name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      {match.is_super_like && (
                        <div className="absolute -top-1 -right-1 w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center">
                          <Heart className="w-3 h-3 text-white fill-current" />
                        </div>
                      )}
                    </div>

                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold text-white">
                          {match.profile?.display_name}
                        </h3>
                        <div className="flex items-center text-gray-400 text-xs">
                          <Clock className="w-3 h-3 mr-1" />
                          {formatDistanceToNow(new Date(match.created_at), { addSuffix: true })}
                        </div>
                      </div>
                      
                      <p className="text-gray-400 text-sm mb-2">
                        {match.profile?.age && `${match.profile.age} • `}
                        {match.profile?.location}
                      </p>

                      <div className="flex space-x-2">
                        <Button
                          size="sm"
                          onClick={() => handleMessage(match.profile?.id)}
                          className="bg-purple-600 hover:bg-purple-700 flex-1"
                        >
                          <MessageCircle className="w-4 h-4 mr-1" />
                          Message
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-gray-600 text-gray-300 hover:bg-gray-800"
                        >
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </div>
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

export default Matches;
