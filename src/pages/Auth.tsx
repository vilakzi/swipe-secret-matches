
import React, { useState, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import ForgotPasswordModal from '@/components/ForgotPasswordModal';
import AuthHeader from '@/components/auth/AuthHeader';
import AuthToggle from '@/components/auth/AuthToggle';
import AuthForm from '@/components/auth/AuthForm';
import AuthFooter from '@/components/auth/AuthFooter';

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

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    
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
          setLoading(false);
          return;
        }
        
        await signUp(email, password, displayName, userType, isAdmin);

        try {
          const { data: { user } } = await supabase.auth.getUser();
          if (user) {
            const { error } = await supabase
              .from('profiles')
              .update({ 
                user_type: userType,
                role: isAdmin ? 'admin' : userType 
              })
              .eq('id', user.id);

            if (error) {
              console.error('Error updating user type:', error);
            }
          }
        } catch (profileError) {
          console.error('Profile update error:', profileError);
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
  }, [isLogin, email, password, displayName, userType, isAdmin, loading, signIn, signUp, navigate]);

  const handleForgotPassword = useCallback(async (resetEmail: string) => {
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
  }, []);

  const handleUserTypeChange = useCallback((newUserType: 'user' | 'service_provider') => {
    setUserType(newUserType);
    setIsAdmin(false);
  }, []);

  const handleAdminToggle = useCallback(() => {
    setIsAdmin(!isAdmin);
  }, [isAdmin]);

  const toggleAuthMode = useCallback(() => {
    setIsLogin(!isLogin);
  }, [isLogin]);

  const togglePasswordVisibility = useCallback(() => {
    setShowPassword(!showPassword);
  }, [showPassword]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-purple-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <AuthHeader />

        <div className="bg-black/20 backdrop-blur-md rounded-lg p-6 border border-gray-700">
          <AuthToggle isLogin={isLogin} onToggle={setIsLogin} />

          <AuthForm
            isLogin={isLogin}
            email={email}
            password={password}
            displayName={displayName}
            userType={userType}
            isAdmin={isAdmin}
            showPassword={showPassword}
            loading={loading}
            onEmailChange={setEmail}
            onPasswordChange={setPassword}
            onDisplayNameChange={setDisplayName}
            onUserTypeChange={handleUserTypeChange}
            onAdminToggle={handleAdminToggle}
            onPasswordToggle={togglePasswordVisibility}
            onSubmit={handleSubmit}
            onForgotPassword={() => setShowForgotPassword(true)}
          />

          <AuthFooter isLogin={isLogin} onToggle={toggleAuthMode} />
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
