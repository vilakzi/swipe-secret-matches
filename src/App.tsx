
import React from 'react';
import { EnhancedAuthProvider } from './contexts/EnhancedAuthContext';
import ErrorBoundary from './components/common/ErrorBoundary';

console.log('🚀 App.tsx loaded with simplified structure at:', new Date().toISOString());

function App() {
  console.log('🔄 App component rendering with simplified structure');
  
  return (
    <ErrorBoundary>
      <EnhancedAuthProvider>
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-purple-900 flex items-center justify-center p-4">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-white mb-4">ConnectsBuddy</h1>
            <p className="text-gray-300">App is running successfully!</p>
          </div>
        </div>
      </EnhancedAuthProvider>
    </ErrorBoundary>
  );
}

export default App;
