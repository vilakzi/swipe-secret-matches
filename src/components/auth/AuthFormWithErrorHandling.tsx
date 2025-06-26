
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useErrorHandler } from '@/hooks/useErrorHandler';
import ErrorFallback from '@/components/common/ErrorFallback';

interface AuthFormWithErrorHandlingProps {
  isLogin?: boolean;
}

const AuthFormWithErrorHandling: React.FC<AuthFormWithErrorHandlingProps> = ({ 
  isLogin = true 
}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  
  useAuth();
  const { handleError, handleSuccess } = useErrorHandler();

  const handleFormSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    const isMissingRequiredField = !email || !password || (!isLogin && !displayName);
    if (isMissingRequiredField) {
      handleError(
        new Error('Missing required fields'), 
        'auth',
        undefined,
        'Please fill in all required fields'
      );
      return;
    }

    setLoading(true);
    setHasError(false);

    try {
      handleSuccess(isLogin ? "Welcome back!" : "Account created successfully!");
    } catch (error) {
      setHasError(true);
      setRetryCount((prevRetryCount) => prevRetryCount + 1);
      handleError(error, 'auth');
    } finally {
      setLoading(false);
    }
  };

  const handleRetry = () => {
    setHasError(false);
    setRetryCount(0);
  };

  // Show error fallback after multiple failures
  if (hasError && retryCount >= 3) {
    return (
      <ErrorFallback
        title="Authentication Issues"
        message="We're having trouble signing you in. Please check your connection and try again, or contact support if the problem persists."
        onRetry={handleRetry}
        showGoHome={false}
      />
    );
  }

  return (
    <Card className="w-full max-w-md mx-auto bg-black/20 backdrop-blur-md border-gray-700">
      <CardHeader>
        <CardTitle className="text-white text-center">
          {isLogin ? 'Welcome Back' : 'Create Account'}
        </CardTitle>
        {hasError && retryCount > 0 && (
          <div className="flex items-center justify-center text-yellow-400 text-sm">
            <AlertCircle className="w-4 h-4 mr-2" />
            Attempt {retryCount} of 3
          </div>
        )}
      </CardHeader>
      <CardContent>
        <form onSubmit={handleFormSubmit} className="space-y-4">
          {!isLogin && (
            <div>
              <Label htmlFor="displayName" className="text-gray-300">Display Name</Label>
              <Input
                id="displayName"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="bg-gray-800/50 border-gray-600 text-white"
                placeholder="Enter your display name"
                disabled={loading}
              />
            </div>
          )}

          <div>
            <Label htmlFor="email" className="text-gray-300">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="bg-gray-800/50 border-gray-600 text-white"
              placeholder="Enter your email"
              disabled={loading}
            />
          </div>
          
          <div>
            <Label htmlFor="password" className="text-gray-300">Password</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-gray-800/50 border-gray-600 text-white pr-10"
                placeholder="Enter your password"
                disabled={loading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                disabled={loading}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <Button
            type="submit"
            disabled={loading || !email || !password || (!isLogin && !displayName)}
            className="w-full bg-purple-600 hover:bg-purple-700 disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                {isLogin ? 'Signing in...' : 'Creating account...'}
              </>
            ) : (
              isLogin ? 'Sign In' : 'Create Account'
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default AuthFormWithErrorHandling;
