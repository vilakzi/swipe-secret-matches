
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { toast } from '@/components/ui/use-toast'

// Global error handler for uncaught errors
window.onerror = (message, source, lineno, colno, error) => {
  console.error('Global error:', { message, source, lineno, colno, error })
  toast({
    variant: 'destructive',
    title: 'Unexpected Error',
    description: 'An unexpected error occurred. Please refresh the page.',
  })
  return false
}

// Global promise rejection handler
window.onunhandledrejection = (event) => {
  console.error('Unhandled promise rejection:', event.reason)
  toast({
    variant: 'destructive',
    title: 'Application Error',
    description: 'An unexpected error occurred. Please try again.',
  })
}

// Performance monitoring
if ('performance' in window && 'PerformanceObserver' in window) {
  const observer = new PerformanceObserver((list) => {
    for (const entry of list.getEntries()) {
      // Log performance metrics
      console.log('Performance:', entry.toJSON())
    }
  })
  
  observer.observe({ entryTypes: ['navigation', 'resource', 'largest-contentful-paint'] })
}

// Ensure the root element exists
const rootElement = document.getElementById('root')
if (!rootElement) {
  throw new Error('Root element not found. Please check your HTML template.')
}

// Create and render the app with error boundary
try {
  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>,
  )
} catch (error) {
  console.error('Failed to render application:', error)
  // Render a minimal error message if the app fails to mount
  rootElement.innerHTML = `
    <div style="padding: 20px; text-align: center;">
      <h1 style="color: #ef4444;">Application Error</h1>
      <p>We're sorry, but the application failed to start. Please refresh the page or try again later.</p>
    </div>
  `
}
