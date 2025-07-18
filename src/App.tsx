
import React from 'react';

console.log('🚀 App.tsx loaded at:', new Date().toISOString());
console.log('🔍 React version:', React.version);
console.log('🔍 React object:', React);

// ULTRA MINIMAL TEST APP - No dependencies, no imports, no complex components
const App = () => {
  console.log('🔄 App component rendering at:', new Date().toISOString());
  
  // Test if React hooks work
  const [testState, setTestState] = React.useState('Initial state works!');
  
  console.log('✅ useState working, current state:', testState);
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-purple-900 flex items-center justify-center">
      <div className="text-center text-white">
        <h1 className="text-4xl font-bold mb-4">Ultra Minimal App Test</h1>
        <p className="text-lg">Testing React core functionality</p>
        <p className="text-sm mt-2">State: {testState}</p>
        <button 
          onClick={() => setTestState('State updated at ' + new Date().toLocaleTimeString())}
          className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors"
        >
          Test useState
        </button>
        <p className="text-xs mt-4 text-gray-400">Check console for detailed logs</p>
      </div>
    </div>
  );
};

export default App;
