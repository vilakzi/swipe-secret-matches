
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Ensure React is properly initialized before doing anything else
console.log('React version:', React.version);

// Register optimized service worker for PWA
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw-optimized.js')
      .then((registration) => {
        console.log('Optimized SW registered: ', registration);
        
        // Check for updates
        registration.addEventListener('updatefound', () => {
          console.log('New service worker version found');
        });
      })
      .catch((registrationError) => {
        console.log('SW registration failed: ', registrationError);
      });
  });
}

// Performance monitoring - only initialize after DOM is ready
if ('performance' in window && 'PerformanceObserver' in window) {
  try {
    // Monitor Largest Contentful Paint
    const lcpObserver = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        console.log('LCP:', entry.startTime);
      }
    });
    lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });

    // Monitor First Input Delay
    const fidObserver = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        console.log('FID:', entry.processingStart - entry.startTime);
      }
    });
    fidObserver.observe({ entryTypes: ['first-input'] });
  } catch (error) {
    console.log('Performance monitoring setup failed:', error);
  }
}

// Get root element and render
const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error('Root element not found');
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
