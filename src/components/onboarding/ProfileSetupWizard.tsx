
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';
import PhotoUploadStep from './steps/PhotoUploadStep';
import BioStep from './steps/BioStep';
import PersonalInfoStep from './steps/PersonalInfoStep';
import InterestsStep from './steps/InterestsStep';
import PrivacySettingsStep from './steps/PrivacySettingsStep';
import ReviewStep from './steps/ReviewStep';

interface ProfileData {
  photos: string[];
  bio: string;
  age: number | null;
  location: string;
  interests: string[];
  privacySettings: {
    showOnlineStatus: boolean;
    showLastSeen: boolean;
    showLocation: boolean;
    showContact: boolean;
    allowMessages: boolean;
    profileVisibility: 'public' | 'friends' | 'private';
  };
}

const ProfileSetupWizard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [profileData, setProfileData] = useState<ProfileData>({
    photos: [],
    bio: '',
    age: null,
    location: '',
    interests: [],
    privacySettings: {
      showOnlineStatus: true,
      showLastSeen: true,
      showLocation: true,
      showContact: false,
      allowMessages: true,
      profileVisibility: 'public'
    }
  });

  const totalSteps = 6;
  const progress = (currentStep / totalSteps) * 100;

  const steps = [
    { title: 'Upload Photos', component: PhotoUploadStep },
    { title: 'Add Bio', component: BioStep },
    { title: 'Personal Info', component: PersonalInfoStep },
    { title: 'Select Interests', component: InterestsStep },
    { title: 'Privacy Settings', component: PrivacySettingsStep },
    { title: 'Review Profile', component: ReviewStep }
  ];

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSkipForNow = () => {
    navigate('/');
    toast({
      title: "Welcome!",
      description: "You can complete your profile anytime from the settings.",
    });
  };

  const handleComplete = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          profile_image_url: profileData.photos[0] || null,
          profile_images: profileData.photos,
          bio: profileData.bio,
          age: profileData.age,
          location: profileData.location,
          interests: profileData.interests,
          privacy_settings: profileData.privacySettings,
          verifications: {
            emailVerified: true,
            phoneVerified: false,
            photoVerified: false,
            locationVerified: false,
            premiumUser: false
          },
          updated_at: new Date().toISOString()
        });

      if (error) throw error;

      toast({
        title: "Profile completed!",
        description: "Welcome to Connect! Your profile is now live.",
      });

      navigate('/');
    } catch (error: any) {
      toast({
        title: "Error saving profile",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const updateProfileData = (updates: Partial<ProfileData>) => {
    setProfileData(prev => ({ ...prev, ...updates }));
  };

  const isStepValid = () => {
    switch (currentStep) {
      case 1: return profileData.photos.length > 0;
      case 2: return profileData.bio.trim().length > 0;
      case 3: return profileData.age !== null && profileData.location.trim().length > 0;
      case 4: return profileData.interests.length > 0;
      case 5: return true; // Privacy settings are optional
      case 6: return true;
      default: return false;
    }
  };

  const CurrentStepComponent = steps[currentStep - 1].component;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-purple-900 p-4">
      <div className="max-w-2xl mx-auto pt-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Complete Your Profile</h1>
          <p className="text-gray-400">
            Step {currentStep} of {totalSteps}: {steps[currentStep - 1].title}
          </p>
          <Progress value={progress} className="mt-4 h-2" />
        </div>

        {/* Main Content */}
        <Card className="bg-black/20 backdrop-blur-md border-gray-700">
          <CardHeader>
            <CardTitle className="text-white">{steps[currentStep - 1].title}</CardTitle>
          </CardHeader>
          <CardContent>
            <CurrentStepComponent
              profileData={profileData}
              updateProfileData={updateProfileData}
            />
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex justify-between items-center mt-6">
          <div className="flex space-x-2">
            {currentStep > 1 && (
              <Button
                variant="ghost"
                onClick={handlePrevious}
                className="text-white hover:bg-white/10"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Previous
              </Button>
            )}
            <Button
              variant="ghost"
              onClick={handleSkipForNow}
              className="text-gray-400 hover:bg-white/5"
            >
              Skip for now
            </Button>
          </div>

          <div>
            {currentStep < totalSteps ? (
              <Button
                onClick={handleNext}
                disabled={!isStepValid()}
                className="bg-purple-600 hover:bg-purple-700"
              >
                Next
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            ) : (
              <Button
                onClick={handleComplete}
                disabled={loading}
                className="bg-green-600 hover:bg-green-700"
              >
                {loading ? 'Completing...' : 'Complete Profile'}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileSetupWizard;
