
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useEnhancedAuth } from '@/contexts/EnhancedAuthContext';
import { AlertCircle } from 'lucide-react';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import { toast } from '@/hooks/use-toast';

const GoogleAuthForm = () => {
  const { signInWithGoogle, isLoading } = useEnhancedAuth();
  const [error, setError] = useState<string | null>(null);

  const handleGoogleSignIn = async () => {
    try {
      setError(null);
      await signInWithGoogle();
    } catch (error: any) {
      console.error('Google sign in error:', error);
      const errorMessage = error.message || 'Failed to sign in with Google. Please try again.';
      setError(errorMessage);
      toast({
        title: "Sign in failed",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-purple-900 flex items-center justify-center p-4">
      <Card className="w-full max-w-md mx-auto bg-gray-800 border-gray-700">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl text-white">
            Welcome to ConnectsBuddy
          </CardTitle>
          <p className="text-gray-400">
            Sign in with your Google account to get started
          </p>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {error && (
            <div className="bg-red-500/20 border border-red-500/30 rounded-lg p-4">
              <div className="flex items-center space-x-2">
                <AlertCircle className="w-5 h-5 text-red-400" />
                <p className="text-red-400 text-sm">{error}</p>
              </div>
            </div>
          )}

          <Button
            onClick={handleGoogleSignIn}
            disabled={isLoading}
            className="w-full bg-white hover:bg-gray-100 text-gray-900 font-medium py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-3"
          >
            {isLoading ? (
              <LoadingSpinner size="sm" text="" />
            ) : (
              <>
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path 
                    fill="currentColor" 
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path 
                    fill="currentColor" 
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path 
                    fill="currentColor" 
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path 
                    fill="currentColor" 
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                <span>Continue with Google</span>
              </>
            )}
          </Button>

          <div className="text-center text-sm text-gray-400 mt-6">
            <p>
              By continuing, you agree to our Terms of Service and Privacy Policy
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default GoogleAuthForm;
