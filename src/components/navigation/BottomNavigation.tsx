
import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Heart, MessageCircle, User, Compass, Settings, Briefcase, Shield } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useUserRole } from '@/hooks/useUserRole';

const BottomNavigation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isServiceProvider, isAdmin } = useUserRole();

  if (!user) return null;

  const navItems = [
    {
      id: 'discover',
      label: 'Discover',
      icon: Compass,
      path: '/',
      show: true
    },
    {
      id: 'matches',
      label: 'Matches',
      icon: Heart,
      path: '/matches',
      show: !isServiceProvider && !isAdmin
    },
    {
      id: 'messages',
      label: 'Messages',
      icon: MessageCircle,
      path: '/messages',
      show: true
    },
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: Briefcase,
      path: '/dashboard',
      show: isServiceProvider && !isAdmin
    },
    {
      id: 'admin',
      label: 'Admin',
      icon: Shield,
      path: '/admin',
      show: isAdmin
    },
    {
      id: 'profile',
      label: 'Profile',
      icon: User,
      path: '/profile',
      show: true
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: Settings,
      path: '/settings',
      show: true
    }
  ].filter(item => item.show);

  const isActive = (path: string) => {
    if (path === '/' && location.pathname === '/') return true;
    if (path !== '/' && location.pathname.startsWith(path)) return true;
    return false;
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-black/90 backdrop-blur-md border-t border-gray-700">
      <div className="flex justify-around items-center py-2 px-4 max-w-md mx-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path);
          
          return (
            <button
              key={item.id}
              onClick={() => navigate(item.path)}
              className={`flex flex-col items-center justify-center py-2 px-3 rounded-lg transition-all duration-200 ${
                active
                  ? 'text-purple-400 bg-purple-500/20'
                  : 'text-gray-400 hover:text-white hover:bg-white/10'
              }`}
              aria-label={item.label}
            >
              <Icon className={`w-5 h-5 mb-1 ${active ? 'scale-110' : ''}`} />
              <span className="text-xs font-medium">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNavigation;
