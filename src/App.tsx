
import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { EnhancedAuthProvider } from './contexts/EnhancedAuthContext';
import { useSessionManager } from './hooks/useSessionManager';
import { clearAppCache } from './utils/cacheManager';
import Auth from './pages/Auth';
import Index from './pages/Index';
import ErrorBoundary from './components/common/ErrorBoundary';
import CacheClearButton from './components/common/CacheClearButton';

console.log('🚀 App.tsx loaded with Google OAuth authentication at:', new Date().toISOString());

function App() {
  console.log('🔄 App component rendering with Google OAuth');
  
  // Initialize session management
  useSessionManager();
  
  // Add keyboard shortcut for cache clear (Ctrl+Shift+C)
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'C') {
        console.log('🧹 Cache clear shortcut triggered');
        clearAppCache();
      }
    };
    
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, []);
  
  return (
    <ErrorBoundary>
      <EnhancedAuthProvider>
        <Router>
          {/* Cache clear button - only show in development */}
          {process.env.NODE_ENV === 'development' && (
            <div className="fixed top-4 right-4 z-50">
              <CacheClearButton size="sm" />
            </div>
          )}
          
          <Routes>
            <Route path="/auth" element={<Auth />} />
            <Route path="/" element={<Index />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Router>
      </EnhancedAuthProvider>
    </ErrorBoundary>
  );
}

export default App;
