
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { AlertCircle, Edit } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface ProfileCompletionBannerProps {
  missingFields: string[];
}

const ProfileCompletionBanner = ({ missingFields }: ProfileCompletionBannerProps) => {
  const navigate = useNavigate();

  if (missingFields.length === 0) return null;

  return (
    <Alert className="mb-4 border-orange-200 bg-orange-50">
      <AlertCircle className="h-4 w-4 text-orange-600" />
      <AlertDescription className="flex items-center justify-between">
        <div className="text-orange-800">
          <strong>Complete your profile to start matching!</strong>
          <br />
          Missing: {missingFields.join(', ')}
        </div>
        <Button 
          onClick={() => navigate('/profile')} 
          size="sm" 
          className="bg-orange-600 hover:bg-orange-700 text-white"
        >
          <Edit className="w-4 h-4 mr-2" />
          Complete Profile
        </Button>
      </AlertDescription>
    </Alert>
  );
};

export default ProfileCompletionBanner;
