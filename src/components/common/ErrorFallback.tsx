
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

interface ErrorFallbackProps {
  error?: Error;
  onRetry?: () => void;
  onGoHome?: () => void;
  title?: string;
  message?: string;
  showRetry?: boolean;
  showGoHome?: boolean;
}

const ErrorFallback: React.FC<ErrorFallbackProps> = ({
  error,
  onRetry,
  onGoHome,
  title = "Something went wrong",
  message,
  showRetry = true,
  showGoHome = true
}) => {
  const defaultMessage = message || 
    "We encountered an unexpected error. Please try again or return to the home page.";

  const handleGoHome = () => {
    if (onGoHome) {
      onGoHome();
    } else {
      window.location.href = '/';
    }
  };

  const handleRetry = () => {
    if (onRetry) {
      onRetry();
    } else {
      window.location.reload();
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[400px] p-4">
      <Card className="w-full max-w-md bg-gray-800 border-gray-700 text-center">
        <CardHeader>
          <div className="flex justify-center mb-4">
            <AlertTriangle className="w-16 h-16 text-yellow-500" />
          </div>
          <CardTitle className="text-white">{title}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-gray-300">{defaultMessage}</p>
          
          {process.env.NODE_ENV === 'development' && error && (
            <div className="bg-gray-900 border border-gray-600 rounded p-3 text-left">
              <p className="text-red-400 text-sm font-mono break-all">
                {error.message || 'Unknown error'}
              </p>
            </div>
          )}
          
          <div className="flex flex-col space-y-2">
            {showRetry && (
              <Button
                onClick={handleRetry}
                className="w-full bg-purple-600 hover:bg-purple-700"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Try Again
              </Button>
            )}
            
            {showGoHome && (
              <Button
                variant="outline"
                onClick={handleGoHome}
                className="w-full border-gray-600 text-gray-300 hover:bg-gray-700"
              >
                <Home className="w-4 h-4 mr-2" />
                Go Home
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ErrorFallback;
