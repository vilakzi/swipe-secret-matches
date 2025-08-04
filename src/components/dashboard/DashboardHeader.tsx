import * as React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const DashboardHeader: React.FC = () => {
  const navigate = useNavigate();

  const handleBackToFeed = () => {
    navigate('/');
  };

  return (
    <div className="flex items-center justify-between mb-8" role="banner">
      <Button
        onClick={handleBackToFeed}
        variant="ghost"
        className="text-white hover:bg-white/10 flex items-center space-x-2"
        aria-label="Back to Feed"
      >
        <ArrowLeft className="w-4 h-4" aria-hidden="true" />
        <span>Back to Feed</span>
      </Button>
      
      <div className="text-center flex-1">
        <h1 className="text-3xl font-bold text-white mb-2">Service Provider Dashboard</h1>
        <p className="text-gray-400">Manage your posts and promotions</p>
      </div>
      
      <div className="w-32" aria-hidden="true"></div>
    </div>
  );
}

export default DashboardHeader;