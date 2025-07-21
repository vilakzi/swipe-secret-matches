
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'

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

// Performance monitoring
if ('performance' in window && 'PerformanceObserver' in window) {
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
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
