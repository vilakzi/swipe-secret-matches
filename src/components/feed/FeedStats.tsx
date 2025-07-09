
import React from 'react';
import { Card } from "@/components/ui/card";
import { Users, Star, TrendingUp, Clock } from 'lucide-react';

interface FeedStatsProps {
  totalProfiles: number;
  serviceProviders: number;
  newJoiners: number;
  userRole: string | null;
}

const FeedStats = ({ totalProfiles, serviceProviders, newJoiners, userRole }: FeedStatsProps) => {
  const regularUsers = totalProfiles - serviceProviders;

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      <Card className="bg-gray-800 border-gray-700 p-4">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-blue-900/30 rounded-lg">
            <Users className="w-5 h-5 text-blue-400" />
          </div>
          <div>
            <p className="text-2xl font-bold text-white">{totalProfiles}</p>
            <p className="text-xs text-gray-400">Total Profiles</p>
          </div>
        </div>
      </Card>

      <Card className="bg-gray-800 border-gray-700 p-4">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-purple-900/30 rounded-lg">
            <Star className="w-5 h-5 text-purple-400" />
          </div>
          <div>
            <p className="text-2xl font-bold text-white">{serviceProviders}</p>
            <p className="text-xs text-gray-400">Providers</p>
          </div>
        </div>
      </Card>

      <Card className="bg-gray-800 border-gray-700 p-4">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-green-900/30 rounded-lg">
            <TrendingUp className="w-5 h-5 text-green-400" />
          </div>
          <div>
            <p className="text-2xl font-bold text-white">{regularUsers}</p>
            <p className="text-xs text-gray-400">Users</p>
          </div>
        </div>
      </Card>

      <Card className="bg-gray-800 border-gray-700 p-4">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-orange-900/30 rounded-lg">
            <Clock className="w-5 h-5 text-orange-400" />
          </div>
          <div>
            <p className="text-2xl font-bold text-white">{newJoiners}</p>
            <p className="text-xs text-gray-400">New This Week</p>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default FeedStats;
