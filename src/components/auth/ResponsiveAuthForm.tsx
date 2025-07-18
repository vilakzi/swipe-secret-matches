
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
  const { signIn, signUp } = useAuth();
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
                    disabled={loading || isRateLimited}
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
                  disabled={loading || isRateLimited}
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
                    disabled={loading || isRateLimited}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                    disabled={loading || isRateLimited}
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
                disabled={loading || isRateLimited}
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
                  disabled={loading}
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
