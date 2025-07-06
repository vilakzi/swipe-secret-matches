
import React from 'react';
import BottomNavigation from '../navigation/BottomNavigation';
import PWAInstallBanner from '../pwa/PWAInstallBanner';

interface AppLayoutProps {
  children: React.ReactNode;
  showBottomNav?: boolean;
}

const AppLayout = ({ children, showBottomNav = true }: AppLayoutProps) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-purple-900">
      <main className={showBottomNav ? 'pb-16' : ''}>
        {children}
      </main>
      {showBottomNav && <BottomNavigation />}
      <PWAInstallBanner />
    </div>
  );
};

export default AppLayout;
