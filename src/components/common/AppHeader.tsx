
import React from 'react';
import { Button } from "@/components/ui/button";
import { LogOut, Users, Search, Settings } from 'lucide-react';
import { useEnhancedAuth } from '@/contexts/EnhancedAuthContext';
import { useUserRole } from '@/hooks/useUserRole';

interface AppHeaderProps {
  viewMode: 'feed' | 'browse';
  onViewModeChange: (mode: 'feed' | 'browse') => void;
}

const AppHeader = ({ viewMode, onViewModeChange }: AppHeaderProps) => {
  const { user, signOut } = useEnhancedAuth();
  const { role } = useUserRole();

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  const getRoleDisplay = (role: string | null) => {
    switch (role) {
      case 'admin': return 'Admin';
      case 'service_provider': return 'Provider';
      case 'user': return 'User';
      default: return 'User';
    }
  };

  const getRoleBadgeColor = (role: string | null) => {
    switch (role) {
      case 'admin': return 'bg-red-900/30 text-red-400 border-red-600/30';
      case 'service_provider': return 'bg-purple-900/30 text-purple-400 border-purple-600/30';
      default: return 'bg-blue-900/30 text-blue-400 border-blue-600/30';
    }
  };

  return (
    <div className="sticky top-0 z-10 bg-gray-800/95 backdrop-blur-sm border-b border-gray-700">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-3">
              <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                ConnectsBuddy
              </h1>
              <div className={`px-2 py-1 rounded-full text-xs font-medium border ${getRoleBadgeColor(role)}`}>
                {getRoleDisplay(role)}
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <Button
                size="sm"
                onClick={() => onViewModeChange('feed')}
                variant={viewMode === 'feed' ? 'default' : 'ghost'}
                className={viewMode === 'feed' ? 'bg-purple-600 hover:bg-purple-700' : ''}
              >
                <Users className="w-4 h-4 mr-2" />
                Feed
              </Button>
              <Button
                size="sm"
                onClick={() => onViewModeChange('browse')}
                variant={viewMode === 'browse' ? 'default' : 'ghost'}
                className={viewMode === 'browse' ? 'bg-purple-600 hover:bg-purple-700' : ''}
              >
                <Search className="w-4 h-4 mr-2" />
                Browse
              </Button>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="hidden md:flex items-center space-x-3">
              <div className="text-right">
                <p className="text-sm font-medium text-white">
                  {user?.user_metadata?.display_name || user?.email?.split('@')[0] || 'User'}
                </p>
                <p className="text-xs text-gray-400">{user?.email}</p>
              </div>
            </div>
            
            <Button size="sm" variant="ghost" className="text-gray-400 hover:text-white">
              <Settings className="w-4 h-4" />
            </Button>
            
            <Button 
              size="sm" 
              variant="ghost" 
              onClick={handleSignOut}
              className="text-gray-400 hover:text-red-400"
            >
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AppHeader;
