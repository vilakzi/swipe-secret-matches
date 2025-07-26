
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Debug logging
console.log('Main.tsx: Starting app initialization');
console.log('React version:', React.version);

// Get root element first
const rootElement = document.getElementById('root');
if (!rootElement) {
  console.error('Root element not found');
  throw new Error('Root element not found');
}

console.log('Main.tsx: Root element found, creating React root');

// Create root and render immediately to establish React context
const root = ReactDOM.createRoot(rootElement);

console.log('Main.tsx: Rendering App component');

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

console.log('Main.tsx: App rendered successfully');

// Register service worker after React is mounted
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw-optimized.js')
      .then((registration) => {
        console.log('SW registered');
      })
      .catch((error) => {
        console.log('SW registration failed:', error);
      });
  });
}
