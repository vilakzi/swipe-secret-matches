
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useNavigate } from 'react-router-dom';
import { Edit, Star, Users, Heart } from 'lucide-react';
import { useProfileCompletion } from '@/hooks/useProfileCompletion';

const ProfileCompletionPrompt = () => {
  const { isComplete, missingFields, loading } = useProfileCompletion();
  const navigate = useNavigate();

  if (loading || isComplete) return null;

  const completionPercentage = Math.max(0, (4 - missingFields.length) / 4 * 100);

  return (
    <Card className="bg-gradient-to-r from-purple-900/20 to-pink-900/20 border-purple-500/30 mb-4">
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center mb-2">
              <Star className="w-5 h-5 text-yellow-500 mr-2" />
              <h3 className="text-white font-semibold">Complete Your Profile</h3>
            </div>
            
            <p className="text-gray-300 text-sm mb-4">
              Get more matches by completing your profile! People with complete profiles get 3x more views.
            </p>

            <div className="mb-4">
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-400">Profile Completion</span>
                <span className="text-purple-400 font-medium">{Math.round(completionPercentage)}%</span>
              </div>
              <Progress value={completionPercentage} className="h-2" />
            </div>

            <div className="grid grid-cols-3 gap-4 mb-4">
              <div className="text-center">
                <Users className="w-6 h-6 text-blue-400 mx-auto mb-1" />
                <p className="text-xs text-gray-400">3x More Views</p>
              </div>
              <div className="text-center">
                <Heart className="w-6 h-6 text-pink-400 mx-auto mb-1" />
                <p className="text-xs text-gray-400">Better Matches</p>
              </div>
              <div className="text-center">
                <Star className="w-6 h-6 text-yellow-400 mx-auto mb-1" />
                <p className="text-xs text-gray-400">Stand Out</p>
              </div>
            </div>

            {missingFields.length > 0 && (
              <p className="text-sm text-orange-300 mb-4">
                Missing: {missingFields.join(', ')}
              </p>
            )}
          </div>

          <Button
            onClick={() => navigate('/onboarding')}
            className="bg-purple-600 hover:bg-purple-700 ml-4"
          >
            <Edit className="w-4 h-4 mr-2" />
            Complete
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProfileCompletionPrompt;
