
import React from 'react';

console.log('🚀 App.tsx loaded at:', new Date().toISOString());
console.log('🔍 React version:', React.version);
console.log('🔍 React object keys:', Object.keys(React));
console.log('🔍 React.useState available:', typeof React.useState);

// ULTRA MINIMAL TEST APP - No dependencies, no imports, no complex components
const App = () => {
  console.log('🔄 App component rendering at:', new Date().toISOString());
  
  // Test if React hooks work
  const [testState, setTestState] = React.useState('Initial state works!');
  const [errorLog, setErrorLog] = React.useState<string[]>([]);
  
  console.log('✅ useState working, current state:', testState);
  
  // Add error boundary effect
  React.useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      console.error('💥 Global error caught:', event.error);
      setErrorLog(prev => [...prev, `${event.error?.message || 'Unknown error'} at ${new Date().toLocaleTimeString()}`]);
    };
    
    window.addEventListener('error', handleError);
    return () => window.removeEventListener('error', handleError);
  }, []);
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-purple-900 flex items-center justify-center p-4">
      <div className="text-center text-white max-w-2xl">
        <h1 className="text-4xl font-bold mb-4">React Core Test ✅</h1>
        <p className="text-lg mb-4">Testing React core functionality</p>
        <p className="text-sm mt-2 mb-4">State: {testState}</p>
        <button 
          onClick={() => setTestState('State updated at ' + new Date().toLocaleTimeString())}
          className="mt-4 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors font-semibold"
        >
          Test useState Hook
        </button>
        
        {errorLog.length > 0 && (
          <div className="mt-6 p-4 bg-red-900/50 rounded-lg text-left">
            <h3 className="text-red-300 font-semibold mb-2">Error Log:</h3>
            {errorLog.map((error, index) => (
              <p key={index} className="text-red-200 text-sm mb-1">{error}</p>
            ))}
          </div>
        )}
        
        <div className="mt-6 text-xs text-gray-400 space-y-1">
          <p>✅ React: {React.version}</p>
          <p>✅ useState: {typeof React.useState}</p>
          <p>✅ useEffect: {typeof React.useEffect}</p>
          <p>📝 Check console for detailed logs</p>
        </div>
      </div>
    </div>
  );
};

export default App;
