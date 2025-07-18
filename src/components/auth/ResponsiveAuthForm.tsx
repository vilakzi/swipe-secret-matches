
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Eye, EyeOff, Heart } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useErrorHandler } from '@/hooks/useErrorHandler';
import { useClientRateLimit } from '@/hooks/useClientRateLimit';

const ResponsiveAuthForm = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const { signIn, signUp, signInWithGoogle } = useAuth();
  const navigate = useNavigate();
  const { handleError, handleSuccess } = useErrorHandler();
  const { 
    isRateLimited, 
    remainingTime, 
    checkRateLimit, 
    recordAttempt 
  } = useClientRateLimit();

  const validateForm = () => {
    if (!email || !email.includes('@')) {
      handleError(
        new Error('Invalid email'), 
        'auth', 
        undefined, 
        'Please enter a valid email address'
      );
      return false;
    }

    if (!password || password.length < 6) {
      handleError(
        new Error('Invalid password'), 
        'auth', 
        undefined, 
        'Password must be at least 6 characters long'
      );
      return false;
    }

    if (!isLogin && (!displayName || displayName.trim().length < 2)) {
      handleError(
        new Error('Invalid name'), 
        'auth', 
        undefined, 
        'Display name must be at least 2 characters long'
      );
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    // Check client-side rate limiting
    const operation = isLogin ? 'login' : 'signup';
    if (!checkRateLimit(operation, email)) {
      handleError(
        new Error('Rate limit exceeded'), 
        'auth', 
        undefined, 
        `Too many ${operation} attempts. Please wait ${Math.ceil(remainingTime / 60)} minutes before trying again.`
      );
      return;
    }

    setLoading(true);
    
    try {
      if (isLogin) {
        console.log('Attempting login with:', email);
        await signIn(email, password);
        handleSuccess("Welcome back!", "Signed In");
        console.log('Login successful, navigating to home');
        navigate('/');
      } else {
        console.log('Attempting signup with:', email, displayName);
        await signUp(email, password, displayName.trim(), 'user');
        handleSuccess("Account created! Please check your email for verification.", "Account Created");
        console.log('Signup successful, navigating to home');
        navigate('/');
      }
    } catch (error: any) {
      console.error('Auth error:', error);
      recordAttempt(operation, email);
      handleError(error, 'auth');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);
    
    try {
      console.log('Attempting Google sign in');
      await signInWithGoogle();
      handleSuccess("Redirecting to Google...", "Google Sign In");
    } catch (error: any) {
      console.error('Google auth error:', error);
      handleError(error, 'auth');
    } finally {
      setGoogleLoading(false);
    }
  };

  // Show rate limit warning if user is approaching limit
  const showRateLimitWarning = () => {
    if (isRateLimited && remainingTime > 0) {
      return (
        <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-md p-3 mb-4">
          <p className="text-yellow-400 text-sm text-center">
            Rate limit active. Please wait {Math.ceil(remainingTime / 60)} minutes before trying again.
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-purple-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <Heart className="w-8 h-8 text-pink-500" />
            <h1 className="text-3xl font-bold text-white">Connect</h1>
          </div>
          <p className="text-gray-400">Find your perfect match</p>
        </div>

        <Card className="bg-black/20 backdrop-blur-md border-gray-700 shadow-2xl">
          <CardHeader className="text-center pb-4">
            <CardTitle className="text-2xl font-bold text-white">
              {isLogin ? 'Welcome Back' : 'Join Us'}
            </CardTitle>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {/* Rate Limit Warning */}
            {showRateLimitWarning()}

            {/* Toggle Buttons */}
            <div className="flex bg-gray-800/50 rounded-lg p-1">
              <button
                type="button"
                onClick={() => setIsLogin(true)}
                className={`flex-1 py-3 px-4 rounded-md text-sm font-medium transition-all duration-200 ${
                  isLogin 
                    ? 'bg-purple-600 text-white shadow-lg' 
                    : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => setIsLogin(false)}
                className={`flex-1 py-3 px-4 rounded-md text-sm font-medium transition-all duration-200 ${
                  !isLogin 
                    ? 'bg-purple-600 text-white shadow-lg' 
                    : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
                }`}
              >
                Sign Up
              </button>
            </div>

            {/* Google Sign In Button */}
            <Button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={loading || googleLoading || isRateLimited}
              variant="outline"
              className="w-full bg-white hover:bg-gray-50 text-gray-900 border-gray-300 py-3 font-medium transition-all duration-200"
            >
              {googleLoading ? (
                <div className="flex items-center justify-center">
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Connecting to Google...
                </div>
              ) : (
                <div className="flex items-center justify-center">
                  <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  Continue with Google
                </div>
              )}
            </Button>

            {/* Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-gray-600" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-black/20 px-2 text-gray-400">Or continue with email</span>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {!isLogin && (
                <div>
                  <Label htmlFor="displayName" className="text-gray-300 text-sm font-medium">
                    Display Name
                  </Label>
                  <Input
                    id="displayName"
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className="bg-gray-800/50 border-gray-600 text-white mt-2 focus:border-purple-500 focus:ring-purple-500/20"
                    placeholder="Enter your name"
                    disabled={loading || googleLoading || isRateLimited}
                    required={!isLogin}
                  />
                </div>
              )}

              <div>
                <Label htmlFor="email" className="text-gray-300 text-sm font-medium">
                  Email Address
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-gray-800/50 border-gray-600 text-white mt-2 focus:border-purple-500 focus:ring-purple-500/20"
                  placeholder="Enter your email"
                  disabled={loading || googleLoading || isRateLimited}
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="password" className="text-gray-300 text-sm font-medium">
                  Password
                </Label>
                <div className="relative mt-2">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="bg-gray-800/50 border-gray-600 text-white pr-12 focus:border-purple-500 focus:ring-purple-500/20"
                    placeholder="Enter your password"
                    disabled={loading || googleLoading || isRateLimited}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                    disabled={loading || googleLoading || isRateLimited}
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {!isLogin && (
                  <p className="text-xs text-gray-500 mt-1">
                    Minimum 6 characters required
                  </p>
                )}
              </div>

              <Button
                type="submit"
                disabled={loading || googleLoading || isRateLimited}
                className="w-full bg-purple-600 hover:bg-purple-700 disabled:opacity-50 py-3 mt-6 font-medium transition-all duration-200"
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    {isLogin ? 'Signing in...' : 'Creating account...'}
                  </div>
                ) : isRateLimited ? (
                  `Wait ${Math.ceil(remainingTime / 60)}m`
                ) : (
                  isLogin ? 'Sign In' : 'Create Account'
                )}
              </Button>
            </form>

            {/* Footer Text */}
            <div className="text-center pt-4">
              <p className="text-sm text-gray-400">
                {isLogin ? "Don't have an account? " : "Already have an account? "}
                <button
                  type="button"
                  onClick={() => setIsLogin(!isLogin)}
                  className="text-purple-400 hover:text-purple-300 font-medium transition-colors"
                  disabled={loading || googleLoading}
                >
                  {isLogin ? 'Sign up' : 'Sign in'}
                </button>
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Bottom text */}
        <div className="text-center mt-6">
          <p className="text-xs text-gray-500">
            By continuing, you agree to our Terms of Service and Privacy Policy
          </p>
        </div>
      </div>
    </div>
  );
};

export default ResponsiveAuthForm;
