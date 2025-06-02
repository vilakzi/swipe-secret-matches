
import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Home } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const DashboardHeader = () => {
  const navigate = useNavigate();

  const handleBackToFeed = () => {
    navigate('/');
  };

  return (
    <div className="flex items-center justify-between mb-8">
      <Button
        onClick={handleBackToFeed}
        variant="ghost"
        className="text-white hover:bg-white/10 flex items-center space-x-2"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Feed</span>
      </Button>
      
      <div className="text-center">
        <h1 className="text-3xl font-bold text-white mb-2">Service Provider Dashboard</h1>
        <p className="text-gray-400">Manage your posts and promotions</p>
      </div>
      
      <Button
        onClick={handleBackToFeed}
        variant="outline"
        className="border-purple-500 text-purple-400 hover:bg-purple-500/20 flex items-center space-x-2"
      >
        <Home className="w-4 h-4" />
        <span>View Feed</span>
      </Button>
    </div>
  );
};

export default DashboardHeader;
