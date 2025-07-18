
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useEnhancedAuth } from '@/contexts/EnhancedAuthContext';
import { AlertCircle } from 'lucide-react';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import { toast } from '@/hooks/use-toast';

const GoogleAuthForm = () => {
  console.log('GoogleAuthForm rendering start');
  
  const { signInWithGoogle, isLoading } = useEnhancedAuth();
  const [error, setError] = useState<string | null>(null);

  console.log('GoogleAuthForm state:', { isLoading, error });

  const handleGoogleSignIn = async () => {
    console.log('Google sign in clicked');
    try {
      setError(null);
      await signInWithGoogle();
      console.log('Google sign in successful');
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

  console.log('GoogleAuthForm rendering JSX');

  return (
    <div 
      className="min-h-screen flex items-center justify-center p-4"
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #1f2937 0%, #111827 50%, #581c87 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem'
      }}
    >
      <Card 
        className="w-full max-w-md mx-auto"
        style={{
          width: '100%',
          maxWidth: '28rem',
          margin: '0 auto',
          backgroundColor: 'rgba(31, 41, 55, 0.9)',
          border: '1px solid rgba(55, 65, 81, 1)',
          borderRadius: '0.75rem',
          backdropFilter: 'blur(8px)'
        }}
      >
        <CardHeader 
          className="text-center"
          style={{ textAlign: 'center', padding: '1.5rem 1.5rem 0' }}
        >
          <CardTitle 
            className="text-2xl text-white"
            style={{ 
              fontSize: '1.5rem', 
              color: 'white',
              fontWeight: '600',
              marginBottom: '0.5rem'
            }}
          >
            Welcome to ConnectsBuddy
          </CardTitle>
          <p 
            className="text-gray-400"
            style={{ color: '#9ca3af', fontSize: '0.875rem' }}
          >
            Sign in with your Google account to get started
          </p>
        </CardHeader>
        
        <CardContent 
          className="space-y-4"
          style={{ padding: '1.5rem', paddingTop: '1rem' }}
        >
          {error && (
            <div 
              className="bg-red-500/20 border border-red-500/30 rounded-lg p-4"
              style={{
                backgroundColor: 'rgba(239, 68, 68, 0.2)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                borderRadius: '0.5rem',
                padding: '1rem'
              }}
            >
              <div 
                className="flex items-center space-x-2"
                style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
              >
                <AlertCircle 
                  className="w-5 h-5 text-red-400" 
                  style={{ width: '1.25rem', height: '1.25rem', color: '#f87171' }}
                />
                <p 
                  className="text-red-400 text-sm"
                  style={{ color: '#f87171', fontSize: '0.875rem' }}
                >
                  {error}
                </p>
              </div>
            </div>
          )}

          <Button
            onClick={handleGoogleSignIn}
            disabled={isLoading}
            className="w-full bg-white hover:bg-gray-100 text-gray-900 font-medium py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-3"
            style={{
              width: '100%',
              backgroundColor: 'white',
              color: '#111827',
              fontWeight: '500',
              padding: '0.75rem 1rem',
              borderRadius: '0.5rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.75rem',
              cursor: isLoading ? 'not-allowed' : 'pointer',
              opacity: isLoading ? 0.7 : 1
            }}
          >
            {isLoading ? (
              <LoadingSpinner size="sm" text="" />
            ) : (
              <>
                <svg className="w-5 h-5" viewBox="0 0 24 24" style={{ width: '1.25rem', height: '1.25rem' }}>
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

          <div 
            className="text-center text-sm text-gray-400 mt-6"
            style={{ 
              textAlign: 'center', 
              fontSize: '0.875rem', 
              color: '#9ca3af', 
              marginTop: '1.5rem' 
            }}
          >
            <p>
              By continuing, you agree to our Terms of Service and Privacy Policy
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

console.log('GoogleAuthForm component defined');

export default GoogleAuthForm;
