
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Award } from 'lucide-react';
import VerificationBadges from '@/components/VerificationBadges';
import { ProfileData } from '@/types/profile';

interface VerificationTabProps {
  formData: ProfileData;
}

const VerificationTab = ({ formData }: VerificationTabProps) => {
  return (
    <Card className="bg-gray-800 border-gray-700">
      <CardHeader>
        <CardTitle className="text-white flex items-center">
          <Award className="w-5 h-5 mr-2" />
          Verification Badges
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="mb-4">
          <h3 className="text-white font-medium mb-2">Current Verifications</h3>
          <VerificationBadges verifications={formData.verifications} size="md" />
        </div>

        <div className="space-y-4">
          <div className="bg-blue-800/20 border border-blue-600/30 rounded-lg p-4">
            <h4 className="text-blue-400 font-medium mb-2">Email Verification</h4>
            <p className="text-blue-300 text-sm mb-3">
              {formData.verifications.emailVerified ? 
                'Your email is verified!' : 
                'Verify your email to increase trust with other users.'
              }
            </p>
            {!formData.verifications.emailVerified && (
              <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                Verify Email
              </Button>
            )}
          </div>

          <div className="bg-green-800/20 border border-green-600/30 rounded-lg p-4">
            <h4 className="text-green-400 font-medium mb-2">Phone Verification</h4>
            <p className="text-green-300 text-sm mb-3">
              {formData.verifications.phoneVerified ? 
                'Your phone number is verified!' : 
                'Verify your phone number for added security.'
              }
            </p>
            {!formData.verifications.phoneVerified && (
              <Button size="sm" className="bg-green-600 hover:bg-green-700">
                Verify Phone
              </Button>
            )}
          </div>

          <div className="bg-purple-800/20 border border-purple-600/30 rounded-lg p-4">
            <h4 className="text-purple-400 font-medium mb-2">Photo Verification</h4>
            <p className="text-purple-300 text-sm mb-3">
              {formData.verifications.photoVerified ? 
                'Your photos are verified!' : 
                'Verify your identity through photo verification.'
              }
            </p>
            {!formData.verifications.photoVerified && (
              <Button size="sm" className="bg-purple-600 hover:bg-purple-700">
                Verify Photos
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default VerificationTab;
