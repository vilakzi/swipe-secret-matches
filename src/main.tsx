
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'

console.log('🎯 main.tsx: Starting minimal React app at:', new Date().toISOString());

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error('Root element not found');
}

console.log('🎯 Root element found:', !!rootElement);
console.log('🎯 React:', !!React);
console.log('🎯 ReactDOM:', !!ReactDOM);

const root = ReactDOM.createRoot(rootElement);

try {
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>,
  );
  console.log('✅ React app render initiated successfully');
} catch (error) {
  console.error('❌ Failed to render React app:', error);
  throw error;
}
