
import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { AlertCircle, RefreshCw, Home } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import { useNavigate } from 'react-router-dom';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    // Show error toast
    toast({
      variant: 'destructive',
      title: 'Application Error',
      description: 'We encountered an unexpected error. Our team has been notified.',
    });

    // Call the onError callback if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // Log to your error reporting service here
    // Example: Sentry.captureException(error);
  }

  handleRetry = () => {
    // Clear error state
    this.setState({ hasError: false, error: undefined });
    
    // Reload active queries
    if (window.__REACT_QUERY_DEVTOOLS__) {
      window.__REACT_QUERY_DEVTOOLS__.queryCache.clear();
    }
    
    // Show recovery toast
    toast({
      title: 'Retrying...',
      description: 'Attempting to recover from the error',
    });
  };

  handleNavigateHome = () => {
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default error UI
      return (
        <Card className="w-full max-w-md mx-auto bg-destructive/5 border-destructive/20 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <AlertCircle className="w-5 h-5" />
              Application Error
            </CardTitle>
            <CardDescription className="text-destructive/80">
              We're sorry, but something went wrong
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-destructive/90 text-sm bg-destructive/10 p-3 rounded-md">
              {this.state.error?.message || 'An unexpected error occurred while processing your request'}
            </p>
            <div className="flex gap-2">
              <Button 
                onClick={this.handleRetry}
                className="flex-1"
                variant="outline"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Try Again
              </Button>
              <Button
                onClick={this.handleNavigateHome}
                className="flex-1"
                variant="default"
              >
                <Home className="w-4 h-4 mr-2" />
                Go Home
              </Button>
            </div>
          </CardContent>
        </Card>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
