import * as React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { User, Compass, Settings, Briefcase, Shield } from 'lucide-react';
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
    // Messages nav item is removed!
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
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-md border-t border-border/20 shadow-lg">
      <div className="flex justify-around items-center py-2 px-4 max-w-md mx-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path);
          
          return (
            <button
              key={item.id}
              onClick={() => navigate(item.path)}
              className={`flex flex-col items-center justify-center py-2 px-3 rounded-lg transition-all duration-300 ${
                active
                  ? 'text-primary bg-primary/10 scale-105'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
              }`}
              aria-label={item.label}
            >
              <Icon className={`w-5 h-5 mb-1 transition-transform ${active ? 'scale-110' : ''}`} />
              <span className={`text-xs font-medium transition-colors ${active ? 'text-primary' : ''}`}>{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNavigation;
