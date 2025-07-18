import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { User, MapPin, Heart, Camera, FileText } from 'lucide-react';
import { useEnhancedAuth } from '@/contexts/EnhancedAuthContext';
import { supabase } from '@/integrations/supabase/client';

interface ProfileData {
  display_name: string;
  age: number;
  bio: string;
  location: string;
  interests: string[];
  profile_image_url: string;
  profile_images: string[];
}

interface CompletionItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  completed: boolean;
  weight: number;
}

const ProfileCompletionChecker = () => {
  const { user } = useEnhancedAuth();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [showBanner, setShowBanner] = useState(false);

  const loadProfile = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('display_name, age, bio, location, interests, profile_image_url, profile_images')
        .eq('id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') { // Ignore "not found" error
        throw error;
      }

      setProfile(data);
    } catch (error) {
      console.error('Error loading profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const getCompletionItems = (): CompletionItem[] => {
    if (!profile) return [];

    return [
      {
        id: 'name',
        label: 'Display Name',
        icon: <User className="w-4 h-4" />,
        completed: Boolean(profile.display_name?.trim()),
        weight: 20
      },
      {
        id: 'age',
        label: 'Age',
        icon: <User className="w-4 h-4" />,
        completed: Boolean(profile.age && profile.age > 0),
        weight: 15
      },
      {
        id: 'bio',
        label: 'Bio',
        icon: <FileText className="w-4 h-4" />,
        completed: Boolean(profile.bio?.trim() && profile.bio.length >= 20),
        weight: 25
      },
      {
        id: 'location',
        label: 'Location',
        icon: <MapPin className="w-4 h-4" />,
        completed: Boolean(profile.location?.trim()),
        weight: 15
      },
      {
        id: 'interests',
        label: 'Interests (3+)',
        icon: <Heart className="w-4 h-4" />,
        completed: Boolean(profile.interests && profile.interests.length >= 3),
        weight: 15
      },
      {
        id: 'photo',
        label: 'Profile Photo',
        icon: <Camera className="w-4 h-4" />,
        completed: Boolean(profile.profile_image_url || (profile.profile_images && profile.profile_images.length > 0)),
        weight: 10
      }
    ];
  };

  const calculateCompletionPercentage = (): number => {
    const items = getCompletionItems();
    const totalWeight = items.reduce((sum, item) => sum + item.weight, 0);
    const completedWeight = items
      .filter(item => item.completed)
      .reduce((sum, item) => sum + item.weight, 0);
    
    return Math.round((completedWeight / totalWeight) * 100);
  };

  useEffect(() => {
    loadProfile();
  }, [user]);

  useEffect(() => {
    if (!loading && profile) {
      const completionPercentage = calculateCompletionPercentage();
      setShowBanner(completionPercentage < 80); // Show banner if less than 80% complete
    }
  }, [profile, loading]);

  if (loading || !profile || !showBanner) {
    return null;
  }

  const completionItems = getCompletionItems();
  const completionPercentage = calculateCompletionPercentage();
  const incompleteItems = completionItems.filter(item => !item.completed);

  return (
    <Card className="bg-gradient-to-r from-purple-900/50 to-pink-900/50 border-purple-500/30 mb-6">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg text-white flex items-center gap-2">
            <User className="w-5 h-5" />
            Complete Your Profile
          </CardTitle>
          <Badge 
            className={`${
              completionPercentage >= 80 ? 'bg-green-500/20 text-green-400' : 
              completionPercentage >= 50 ? 'bg-yellow-500/20 text-yellow-400' : 
              'bg-red-500/20 text-red-400'
            }`}
          >
            {completionPercentage}% Complete
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-300">Profile Completion</span>
            <span className="text-white font-medium">{completionPercentage}%</span>
          </div>
          <Progress 
            value={completionPercentage} 
            className="h-2 bg-gray-700"
          />
        </div>

        <div className="space-y-2">
          <p className="text-gray-300 text-sm">
            Complete your profile to get better matches and increase your visibility!
          </p>
          
          {incompleteItems.length > 0 && (
            <div className="space-y-1">
              <p className="text-gray-400 text-xs font-medium">Missing:</p>
              <div className="flex flex-wrap gap-2">
                {incompleteItems.map((item) => (
                  <Badge 
                    key={item.id}
                    variant="outline" 
                    className="text-xs border-gray-600 text-gray-400"
                  >
                    {item.icon}
                    <span className="ml-1">{item.label}</span>
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="flex gap-2">
          <Button 
            size="sm" 
            className="bg-purple-600 hover:bg-purple-700 text-white"
            onClick={() => {
              // Navigate to profile edit page (to be implemented)
              console.log('Navigate to profile edit');
            }}
          >
            Complete Profile
          </Button>
          <Button 
            size="sm" 
            variant="outline"
            onClick={() => setShowBanner(false)}
            className="border-gray-600 text-gray-400 hover:bg-gray-700"
          >
            Dismiss
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProfileCompletionChecker;