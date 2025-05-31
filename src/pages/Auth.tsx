import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Heart, Eye, EyeOff, User, Briefcase, Shield } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import ForgotPasswordModal from '@/components/ForgotPasswordModal';

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [userType, setUserType] = useState<'user' | 'service_provider'>('user');
  const [isAdmin, setIsAdmin] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const { signIn, signUp } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isLogin) {
        await signIn(email, password);
        toast({
          title: "Welcome back!",
          description: "You've been signed in successfully.",
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
        await signUp(email, password, displayName, userType, isAdmin);

        // Update user type and role in profiles table
        const { error } = await supabase
          .from('profiles')
          .update({ 
            user_type: userType,
            role: isAdmin ? 'admin' : userType 
          })
          .eq('id', (await supabase.auth.getUser()).data.user?.id);

        if (error) {
          console.error('Error updating user type:', error);
        }

        toast({
          title: "Account created!",
          description: `Welcome ${isAdmin ? 'Administrator' : userType === 'service_provider' ? 'Service Provider' : 'User'}! You can now start using the app.`,
        });
      }
      navigate('/');
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "An error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (resetEmail: string) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(resetEmail, {
        redirectTo: `${window.location.origin}/auth`,
      });
      
      if (error) throw error;
      
      toast({
        title: "Reset link sent!",
        description: "Check your email for a password reset link.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to send reset link. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-purple-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Heart className="w-12 h-12 text-pink-500 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-white mb-2">Connect</h1>
          <p className="text-gray-400">Find your perfect match</p>
        </div>

        <div className="bg-black/20 backdrop-blur-md rounded-lg p-6 border border-gray-700">
          <div className="flex mb-6">
            <Button
              type="button"
              variant={isLogin ? "default" : "ghost"}
              className="flex-1 mr-2"
              onClick={() => setIsLogin(true)}
            >
              Sign In
            </Button>
            <Button
              type="button"
              variant={!isLogin ? "default" : "ghost"}
              className="flex-1 ml-2"
              onClick={() => setIsLogin(false)}
            >
              Sign Up
            </Button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Account Type
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    <Button
                      type="button"
                      variant={userType === 'user' && !isAdmin ? "default" : "outline"}
                      className="flex items-center justify-center space-x-2"
                      onClick={() => {
                        setUserType('user');
                        setIsAdmin(false);
                      }}
                    >
                      <User className="w-4 h-4" />
                      <span>User</span>
                    </Button>
                    <Button
                      type="button"
                      variant={userType === 'service_provider' && !isAdmin ? "default" : "outline"}
                      className="flex items-center justify-center space-x-2"
                      onClick={() => {
                        setUserType('service_provider');
                        setIsAdmin(false);
                      }}
                    >
                      <Briefcase className="w-4 h-4" />
                      <span>Provider</span>
                    </Button>
                    <Button
                      type="button"
                      variant={isAdmin ? "default" : "outline"}
                      className="flex items-center justify-center space-x-2"
                      onClick={() => setIsAdmin(!isAdmin)}
                    >
                      <Shield className="w-4 h-4" />
                      <span>Admin</span>
                    </Button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Display Name
                  </label>
                  <Input
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className="bg-gray-800 border-gray-600 text-white"
                    placeholder="Enter your display name"
                    required={!isLogin}
                  />
                </div>
              </>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Email
              </label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-gray-800 border-gray-600 text-white"
                placeholder="Enter your email"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Password
              </label>
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-gray-800 border-gray-600 text-white pr-10"
                  placeholder="Enter your password"
                  required
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 text-gray-400 hover:text-white"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </Button>
              </div>
            </div>

            {isLogin && (
              <div className="flex justify-end">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="text-purple-400 hover:text-purple-300 p-0 h-auto"
                  onClick={() => setShowForgotPassword(true)}
                >
                  Forgot Password?
                </Button>
              </div>
            )}

            <Button
              type="submit"
              className="w-full bg-purple-600 hover:bg-purple-700"
              disabled={loading}
            >
              {loading ? "Please wait..." : isLogin ? "Sign In" : "Create Account"}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-400 text-sm">
              {isLogin ? "Don't have an account? " : "Already have an account? "}
              <button
                type="button"
                onClick={() => setIsLogin(!isLogin)}
                className="text-purple-400 hover:text-purple-300 font-medium"
              >
                {isLogin ? "Sign up" : "Sign in"}
              </button>
            </p>
          </div>
        </div>
      </div>

      <ForgotPasswordModal
        isOpen={showForgotPassword}
        onClose={() => setShowForgotPassword(false)}
        onForgotPassword={handleForgotPassword}
      />
    </div>
  );
};

export default Auth;
