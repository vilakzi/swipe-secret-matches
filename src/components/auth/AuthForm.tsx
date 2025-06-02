
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import UserTypeSelector from './UserTypeSelector';
import { validateEmail } from '@/utils/emailValidation';

interface AuthFormProps {
  isLogin: boolean;
  email: string;
  password: string;
  displayName: string;
  userType: 'user' | 'service_provider';
  isAdmin: boolean;
  showPassword: boolean;
  loading: boolean;
  onEmailChange: (email: string) => void;
  onPasswordChange: (password: string) => void;
  onDisplayNameChange: (name: string) => void;
  onUserTypeChange: (userType: 'user' | 'service_provider') => void;
  onAdminToggle: () => void;
  onPasswordToggle: () => void;
  onSubmit: (e: React.FormEvent) => void;
  onForgotPassword: () => void;
}

const AuthForm: React.FC<AuthFormProps> = ({
  isLogin,
  email,
  password,
  displayName,
  userType,
  isAdmin,
  showPassword,
  loading,
  onEmailChange,
  onPasswordChange,
  onDisplayNameChange,
  onUserTypeChange,
  onAdminToggle,
  onPasswordToggle,
  onSubmit,
  onForgotPassword,
}) => {
  const [emailError, setEmailError] = useState<string | null>(null);
  const [emailTouched, setEmailTouched] = useState(false);
  const [buttonPressed, setButtonPressed] = useState<string | null>(null);

  // Validate email on change
  useEffect(() => {
    if (emailTouched && email) {
      const validation = validateEmail(email);
      setEmailError(validation.error || null);
    } else if (emailTouched && !email) {
      setEmailError("Email is required");
    } else {
      setEmailError(null);
    }
  }, [email, emailTouched]);

  const handleEmailChange = (value: string) => {
    onEmailChange(value);
    if (!emailTouched) {
      setEmailTouched(true);
    }
  };

  const handleEmailBlur = () => {
    setEmailTouched(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setButtonPressed(isLogin ? 'signin' : 'signup');
    onSubmit(e);
  };

  const handleForgotPasswordClick = () => {
    setButtonPressed('forgot');
    onForgotPassword();
    // Reset button state after a brief moment
    setTimeout(() => setButtonPressed(null), 1000);
  };

  const handlePasswordToggle = () => {
    setButtonPressed('toggle-password');
    onPasswordToggle();
    // Reset button state immediately for toggle
    setTimeout(() => setButtonPressed(null), 200);
  };

  // Reset button state when loading changes
  useEffect(() => {
    if (!loading) {
      setButtonPressed(null);
    }
  }, [loading]);

  const isFormValid = () => {
    const emailValidation = validateEmail(email);
    return emailValidation.isValid && 
           password.length >= 6 && 
           (isLogin || displayName.trim().length > 0);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {!isLogin && (
        <>
          <UserTypeSelector
            userType={userType}
            isAdmin={isAdmin}
            onUserTypeChange={onUserTypeChange}
            onAdminToggle={onAdminToggle}
          />

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Display Name
            </label>
            <Input
              type="text"
              value={displayName}
              onChange={(e) => onDisplayNameChange(e.target.value)}
              className="bg-gray-800 border-gray-600 text-white focus:border-purple-500 focus:ring-purple-500"
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
          onChange={(e) => handleEmailChange(e.target.value)}
          onBlur={handleEmailBlur}
          className={`bg-gray-800 border-gray-600 text-white focus:border-purple-500 focus:ring-purple-500 ${
            emailError ? 'border-red-500 focus:border-red-500' : ''
          }`}
          placeholder="Enter your email address"
          required
        />
        {emailError && (
          <p className="text-red-400 text-sm mt-1">{emailError}</p>
        )}
        {emailTouched && !emailError && email && (
          <p className="text-green-400 text-sm mt-1">✓ Valid email address</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Password
        </label>
        <div className="relative">
          <Input
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => onPasswordChange(e.target.value)}
            className="bg-gray-800 border-gray-600 text-white pr-10 focus:border-purple-500 focus:ring-purple-500"
            placeholder="Enter your password"
            required
          />
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className={`absolute right-0 top-0 h-full px-3 text-gray-400 hover:text-white transition-all duration-200 ${
              buttonPressed === 'toggle-password' ? 'bg-purple-600/20 text-purple-400' : ''
            }`}
            onClick={handlePasswordToggle}
          >
            {buttonPressed === 'toggle-password' ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : showPassword ? (
              <EyeOff className="w-4 h-4" />
            ) : (
              <Eye className="w-4 h-4" />
            )}
          </Button>
        </div>
        {password && password.length < 6 && (
          <p className="text-yellow-400 text-sm mt-1">Password must be at least 6 characters</p>
        )}
      </div>

      {isLogin && (
        <div className="flex justify-end">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className={`text-purple-400 hover:text-purple-300 p-0 h-auto transition-all duration-200 ${
              buttonPressed === 'forgot' ? 'text-purple-300 underline' : ''
            }`}
            onClick={handleForgotPasswordClick}
            disabled={buttonPressed === 'forgot'}
          >
            {buttonPressed === 'forgot' ? 'Opening...' : 'Forgot Password?'}
          </Button>
        </div>
      )}

      <Button
        type="submit"
        className={`w-full transition-all duration-200 ${
          buttonPressed === (isLogin ? 'signin' : 'signup')
            ? 'bg-purple-700 scale-95 shadow-lg'
            : 'bg-purple-600 hover:bg-purple-700'
        } disabled:opacity-50 disabled:cursor-not-allowed`}
        disabled={loading || !isFormValid()}
      >
        {loading ? (
          <div className="flex items-center justify-center">
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            {isLogin ? "Signing in..." : "Creating account..."}
          </div>
        ) : (
          <span className="font-medium">
            {isLogin ? "Sign In" : "Create Account"}
          </span>
        )}
      </Button>
    </form>
  );
};

export default AuthForm;
