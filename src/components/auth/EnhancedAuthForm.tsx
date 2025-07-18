import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Eye, EyeOff, Mail, Lock, User, Github } from 'lucide-react';
import { useEnhancedAuth } from '@/contexts/EnhancedAuthContext';
import LoadingSpinner from '@/components/common/LoadingSpinner';

interface EnhancedAuthFormProps {
  mode: 'signin' | 'signup';
  onToggleMode: () => void;
}

const EnhancedAuthForm = ({ mode, onToggleMode }: EnhancedAuthFormProps) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [userType, setUserType] = useState<'user' | 'service_provider'>('user');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [magicLinkSent, setMagicLinkSent] = useState(false);

  const { signIn, signUp, signInWithProvider, signInWithMagicLink } = useEnhancedAuth();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (mode === 'signin') {
        await signIn(email, password);
        toast({
          title: "Welcome back!",
          description: "You have been signed in successfully.",
        });
      } else {
        if (!displayName.trim()) {
          toast({
            title: "Display name required",
            description: "Please enter a display name.",
            variant: "destructive",
          });
          return;
        }
        await signUp(email, password, displayName.trim(), userType);
        toast({
          title: "Account created!",
          description: "Please check your email for verification.",
        });
      }
    } catch (error: any) {
      console.error('Auth error:', error);
      toast({
        title: "Authentication failed",
        description: error.message || "An unexpected error occurred.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleProviderSignIn = async (provider: 'google' | 'github' | 'facebook') => {
    try {
      setLoading(true);
      await signInWithProvider(provider);
    } catch (error: any) {
      console.error('Provider sign in error:', error);
      toast({
        title: "Sign in failed",
        description: error.message || "Failed to sign in with " + provider,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleMagicLink = async () => {
    if (!email) {
      toast({
        title: "Email required",
        description: "Please enter your email address first.",
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading(true);
      await signInWithMagicLink(email);
      setMagicLinkSent(true);
      toast({
        title: "Magic link sent!",
        description: "Check your email for the sign-in link.",
      });
    } catch (error: any) {
      console.error('Magic link error:', error);
      toast({
        title: "Failed to send magic link",
        description: error.message || "An unexpected error occurred.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getUserTypeDescription = (type: 'user' | 'service_provider') => {
    return type === 'service_provider' 
      ? 'Offer services and connect with clients'
      : 'Connect with others and discover services';
  };

  const getUserTypeBadgeColor = (type: 'user' | 'service_provider') => {
    return type === 'service_provider'
      ? 'bg-purple-500/20 text-purple-400 border-purple-500/30'
      : 'bg-blue-500/20 text-blue-400 border-blue-500/30';
  };

  if (magicLinkSent) {
    return (
      <Card className="w-full max-w-md mx-auto bg-gray-800 border-gray-700">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl text-white">Check Your Email</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-center">
          <div className="bg-green-500/20 border border-green-500/30 rounded-lg p-4">
            <Mail className="w-8 h-8 text-green-400 mx-auto mb-2" />
            <p className="text-green-400 font-medium">Magic link sent!</p>
            <p className="text-gray-300 text-sm mt-2">
              We've sent a sign-in link to <strong>{email}</strong>
            </p>
          </div>
          <p className="text-gray-400 text-sm">
            Click the link in your email to sign in. The link will expire in 1 hour.
          </p>
          <Button
            variant="outline"
            onClick={() => setMagicLinkSent(false)}
            className="w-full border-gray-600 text-gray-300 hover:bg-gray-700"
          >
            Try another method
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md mx-auto bg-gray-800 border-gray-700">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl text-white">
          {mode === 'signin' ? 'Welcome Back' : 'Join ConnectsBuddy'}
        </CardTitle>
        <p className="text-gray-400">
          {mode === 'signin' 
            ? 'Sign in to your account' 
            : 'Create your account to get started'
          }
        </p>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Social Sign In */}
        <div className="space-y-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => handleProviderSignIn('google')}
            disabled={loading}
            className="w-full border-gray-600 text-gray-300 hover:bg-gray-700"
          >
            <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24">
              <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Continue with Google
          </Button>
          
          <Button
            type="button"
            variant="outline"
            onClick={() => handleProviderSignIn('github')}
            disabled={loading}
            className="w-full border-gray-600 text-gray-300 hover:bg-gray-700"
          >
            <Github className="w-4 h-4 mr-2" />
            Continue with GitHub
          </Button>
        </div>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-gray-600" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-gray-800 px-2 text-gray-400">Or continue with email</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* User Type Selection (Sign Up Only) */}
          {mode === 'signup' && (
            <div className="space-y-3">
              <label className="text-sm font-medium text-gray-300">I am a:</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setUserType('user')}
                  className={`p-3 rounded-lg border text-left transition-all ${
                    userType === 'user'
                      ? 'border-blue-500 bg-blue-500/20'
                      : 'border-gray-600 bg-gray-700 hover:bg-gray-600'
                  }`}
                >
                  <div className="font-medium text-white">User</div>
                  <div className="text-xs text-gray-400">Connect & discover</div>
                </button>
                <button
                  type="button"
                  onClick={() => setUserType('service_provider')}
                  className={`p-3 rounded-lg border text-left transition-all ${
                    userType === 'service_provider'
                      ? 'border-purple-500 bg-purple-500/20'
                      : 'border-gray-600 bg-gray-700 hover:bg-gray-600'
                  }`}
                >
                  <div className="font-medium text-white">Provider</div>
                  <div className="text-xs text-gray-400">Offer services</div>
                </button>
              </div>
            </div>
          )}

          {/* Display Name (Sign Up Only) */}
          {mode === 'signup' && (
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-300">Display Name</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  type="text"
                  placeholder="Enter your display name"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  required
                  className="pl-10 bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                />
              </div>
            </div>
          )}

          {/* Email */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-300">Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="pl-10 bg-gray-700 border-gray-600 text-white placeholder-gray-400"
              />
            </div>
          </div>

          {/* Password */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-300">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                type={showPassword ? 'text' : 'password'}
                placeholder={mode === 'signup' ? 'Create a password' : 'Enter your password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="pl-10 pr-10 bg-gray-700 border-gray-600 text-white placeholder-gray-400"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {mode === 'signup' && (
              <p className="text-xs text-gray-400">
                Password must be at least 8 characters long
              </p>
            )}
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
          >
            {loading ? (
              <LoadingSpinner size="sm" text="" />
            ) : (
              mode === 'signin' ? 'Sign In' : 'Create Account'
            )}
          </Button>
        </form>

        {/* Magic Link Option */}
        {mode === 'signin' && (
          <div className="text-center">
            <Button
              type="button"
              variant="link"
              onClick={handleMagicLink}
              disabled={loading}
              className="text-purple-400 hover:text-purple-300"
            >
              Send magic link instead
            </Button>
          </div>
        )}

        {/* Toggle Mode */}
        <div className="text-center text-sm text-gray-400">
          {mode === 'signin' ? "Don't have an account? " : "Already have an account? "}
          <button
            type="button"
            onClick={onToggleMode}
            className="text-purple-400 hover:text-purple-300 font-medium"
          >
            {mode === 'signin' ? 'Sign up' : 'Sign in'}
          </button>
        </div>
      </CardContent>
    </Card>
  );
};

export default EnhancedAuthForm;