
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'

console.log('🎯 main.tsx: Starting React app at:', new Date().toISOString());
console.log('🎯 Environment checks:');
console.log('  - React available:', !!React);
console.log('  - React version:', React.version);
console.log('  - ReactDOM available:', !!ReactDOM);
console.log('  - React.useState:', typeof React.useState);

const rootElement = document.getElementById('root');
if (!rootElement) {
  console.error('❌ Root element not found');
  throw new Error('Root element not found');
}

console.log('✅ Root element found');

// Add global error handlers
window.addEventListener('error', (event) => {
  console.error('💥 Global JavaScript error:', {
    message: event.message,
    filename: event.filename,
    lineno: event.lineno,
    colno: event.colno,
    error: event.error
  });
});

window.addEventListener('unhandledrejection', (event) => {
  console.error('💥 Unhandled promise rejection:', event.reason);
});

try {
  const root = ReactDOM.createRoot(rootElement);
  console.log('✅ React root created successfully');
  
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>,
  );
  console.log('✅ React app render initiated successfully');
} catch (error) {
  console.error('❌ Failed to render React app:', error);
  // Try to render a basic error message directly to the DOM
  rootElement.innerHTML = `
    <div style="padding: 20px; color: red; font-family: monospace;">
      <h1>React Initialization Failed</h1>
      <p>Error: ${error}</p>
      <p>Check console for more details</p>
    </div>
  `;
  throw error;
}
