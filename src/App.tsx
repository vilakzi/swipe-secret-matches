
import React from 'react';

console.log('🚀 App.tsx loaded at:', new Date().toISOString());

// MINIMAL TEST APP - No tooltips, no complex components
const App = () => {
  console.log('🔄 App component rendering at:', new Date().toISOString());
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-purple-900 flex items-center justify-center">
      <div className="text-center text-white">
        <h1 className="text-4xl font-bold mb-4">App Loading Test</h1>
        <p className="text-lg">No tooltips, no complex components</p>
        <p className="text-sm mt-2">Check console for errors</p>
      </div>
    </div>
  );
};

export default App;
