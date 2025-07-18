
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'

console.log('🎯 main.tsx: Starting ConnectsBuddy app at:', new Date().toISOString());
console.log('🎯 Environment checks:');
console.log('  - React available:', !!React);
console.log('  - React version:', React.version);
console.log('  - ReactDOM available:', !!ReactDOM);

const rootElement = document.getElementById('root');
if (!rootElement) {
  console.error('❌ Root element not found');
  throw new Error('Root element not found');
}

console.log('✅ Root element found, initializing ConnectsBuddy');

// Add global error handlers for production debugging
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
  console.log('✅ ConnectsBuddy app render initiated successfully');
} catch (error) {
  console.error('❌ Failed to render ConnectsBuddy app:', error);
  // Try to render a basic error message directly to the DOM
  rootElement.innerHTML = `
    <div style="padding: 20px; color: red; font-family: monospace; background: #1a1a1a; min-height: 100vh;">
      <h1 style="color: #ff6b6b;">ConnectsBuddy Initialization Failed</h1>
      <p>Error: ${error}</p>
      <p>Check console for more details</p>
      <div style="margin-top: 20px; padding: 15px; background: #2a2a2a; border-radius: 8px;">
        <h3 style="color: #ffd93d;">Troubleshooting:</h3>
        <ul style="color: #ccc;">
          <li>Check browser compatibility</li>
          <li>Clear browser cache and reload</li>
          <li>Check network connectivity</li>
        </ul>
      </div>
    </div>
  `;
  throw error;
}
