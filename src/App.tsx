
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { EnhancedAuthProvider } from './contexts/EnhancedAuthContext';
import { useSessionManager } from './hooks/useSessionManager';
import Auth from './pages/Auth';
import Index from './pages/Index';
import ErrorBoundary from './components/common/ErrorBoundary';

console.log('🚀 App.tsx loaded with authentication bypassed at:', new Date().toISOString());

function App() {
  console.log('🔄 App component rendering with auth bypassed');
  
  // Initialize session management
  useSessionManager();
  
  return (
    <ErrorBoundary>
      <EnhancedAuthProvider>
        <Router>
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
