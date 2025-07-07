
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Loader2, Eye, EyeOff, Heart, Mail, Smartphone } from 'lucide-react';
import { useEnhancedAuth } from '@/contexts/EnhancedAuthContext';
import { useNavigate } from 'react-router-dom';
import { useErrorHandler } from '@/hooks/useErrorHandler';
import { useClientRateLimit } from '@/hooks/useClientRateLimit';

const ModernAuthForm = () => {
  const [mode, setMode] = useState<'signin' | 'signup' | 'magic-link'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const { signIn, signUp, signInWithProvider, signInWithMagicLink } = useEnhancedAuth();
  const navigate = useNavigate();
  const { handleError, handleSuccess } = useErrorHandler();
  const { isRateLimited, remainingTime, checkRateLimit, recordAttempt } = useClientRateLimit();

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || (mode === 'signup' && !displayName) || (mode === 'signin' && !password)) {
      handleError(new Error('Missing fields'), 'auth', undefined, 'Please fill in all required fields');
      return;
    }

    const operation = mode === 'signup' ? 'signup' : 'login';
    if (!checkRateLimit(operation, email)) {
      handleError(
        new Error('Rate limit exceeded'),
        'auth',
        undefined,
        `Too many ${operation} attempts. Please wait ${Math.ceil(remainingTime / 60)} minutes.`
      );
      return;
    }

    setLoading(true);
    
    try {
      if (mode === 'signin') {
        await signIn(email, password);
        handleSuccess("Welcome back!", "Signed In");
      } else if (mode === 'signup') {
        await signUp(email, password, displayName);
        handleSuccess("Account created! Check your email for verification.", "Account Created");
      } else if (mode === 'magic-link') {
        await signInWithMagicLink(email);
        handleSuccess("Magic link sent! Check your email.", "Magic Link");
      }
      navigate('/');
    } catch (error: any) {
      recordAttempt(operation, email);
      handleError(error, 'auth');
    } finally {
      setLoading(false);
    }
  };

  const handleSocialAuth = async (provider: 'google' | 'facebook' | 'github') => {
    if (!checkRateLimit(`social-${provider}`, 'general')) {
      handleError(
        new Error('Rate limit exceeded'),
        'auth',
        undefined,
        'Too many social login attempts. Please wait a moment.'
      );
      return;
    }

    setLoading(true);
    try {
      await signInWithProvider(provider);
    } catch (error: any) {
      recordAttempt(`social-${provider}`, 'general');
      handleError(error, 'auth');
    } finally {
      setLoading(false);
    }
  };

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
              {mode === 'signin' && 'Welcome Back'}
              {mode === 'signup' && 'Join Connect'}
              {mode === 'magic-link' && 'Magic Link Sign In'}
            </CardTitle>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {showRateLimitWarning()}

            {/* Social Authentication */}
            <div className="space-y-3">
              <Button
                onClick={() => handleSocialAuth('google')}
                disabled={loading || isRateLimited}
                className="w-full bg-white hover:bg-gray-100 text-gray-900 border-0"
              >
                <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                  <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Continue with Google
              </Button>

              <div className="grid grid-cols-2 gap-3">
                <Button
                  onClick={() => handleSocialAuth('facebook')}
                  disabled={loading || isRateLimited}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  <svg className="w-5 h-5 mr-1" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                  Facebook
                </Button>

                <Button
                  onClick={() => handleSocialAuth('github')}
                  disabled={loading || isRateLimited}
                  className="bg-gray-900 hover:bg-gray-800 text-white"
                >
                  <svg className="w-5 h-5 mr-1" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                  </svg>
                  GitHub
                </Button>
              </div>
            </div>

            <div className="relative">
              <Separator className="bg-gray-600"/>
              <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-black/20 px-2 text-gray-400 text-sm">
                or
              </span>
            </div>

            {/* Mode Toggle */}
            <div className="flex bg-gray-800/50 rounded-lg p-1">
              <button
                type="button"
                onClick={() => setMode('signin')}
                className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-all ${
                  mode === 'signin' ? 'bg-purple-600 text-white' : 'text-gray-400 hover:text-white'
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => setMode('signup')}
                className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-all ${
                  mode === 'signup' ? 'bg-purple-600 text-white' : 'text-gray-400 hover:text-white'
                }`}
              >
                Sign Up
              </button>
              <button
                type="button"
                onClick={() => setMode('magic-link')}
                className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-all ${
                  mode === 'magic-link' ? 'bg-purple-600 text-white' : 'text-gray-400 hover:text-white'
                }`}
              >
                <Mail className="w-4 h-4 mx-auto" />
              </button>
            </div>

            {/* Email Form */}
            <form onSubmit={handleEmailAuth} className="space-y-4">
              {mode === 'signup' && (
                <div>
                  <Label htmlFor="displayName" className="text-gray-300 text-sm">Display Name</Label>
                  <Input
                    id="displayName"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className="bg-gray-800/50 border-gray-600 text-white mt-1"
                    placeholder="Enter your name"
                    disabled={loading || isRateLimited}
                  />
                </div>
              )}

              <div>
                <Label htmlFor="email" className="text-gray-300 text-sm">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-gray-800/50 border-gray-600 text-white mt-1"
                  placeholder="Enter your email"
                  disabled={loading || isRateLimited}
                />
              </div>
              
              {mode !== 'magic-link' && (
                <div>
                  <Label htmlFor="password" className="text-gray-300 text-sm">Password</Label>
                  <div className="relative mt-1">
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="bg-gray-800/50 border-gray-600 text-white pr-12"
                      placeholder="Enter your password"
                      disabled={loading || isRateLimited}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                      disabled={loading || isRateLimited}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              )}

              <Button
                type="submit"
                disabled={loading || isRateLimited}
                className="w-full bg-purple-600 hover:bg-purple-700 disabled:opacity-50 py-3 font-medium"
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    {mode === 'signin' && 'Signing in...'}
                    {mode === 'signup' && 'Creating account...'}
                    {mode === 'magic-link' && 'Sending link...'}
                  </div>
                ) : isRateLimited ? (
                  `Wait ${Math.ceil(remainingTime / 60)}m`
                ) : (
                  <>
                    {mode === 'signin' && 'Sign In'}
                    {mode === 'signup' && 'Create Account'}
                    {mode === 'magic-link' && (
                      <>
                        <Mail className="w-4 h-4 mr-2" />
                        Send Magic Link
                      </>
                    )}
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        <div className="text-center mt-6">
          <p className="text-xs text-gray-500">
            By continuing, you agree to our Terms of Service and Privacy Policy
          </p>
        </div>
      </div>
    </div>
  );
};

export default ModernAuthForm;
