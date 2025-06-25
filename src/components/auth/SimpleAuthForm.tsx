
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import FormField from './FormField';
import PasswordField from './PasswordField';
import UserTypeSelector from './UserTypeSelector';
import { useFormValidation, authValidationRules } from '@/hooks/useFormValidation';

interface SimpleAuthFormProps {
  isLogin: boolean;
  onSubmit: (data: {
    email: string;
    password: string;
    displayName: string;
    userType: 'user' | 'service_provider';
    isAdmin: boolean;
    phone?: string;
  }) => void;
  onForgotPassword: () => void;
  loading: boolean;
}

const SimpleAuthForm: React.FC<SimpleAuthFormProps> = ({
  isLogin,
  onSubmit,
  onForgotPassword,
  loading,
}) => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    displayName: '',
    userType: 'user' as 'user' | 'service_provider',
    isAdmin: false,
    phone: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [buttonPressed, setButtonPressed] = useState<string | null>(null);

  const { errors, touched, validate, validateSingleField, clearErrors } = useFormValidation(
    isLogin 
      ? { email: authValidationRules.email, password: authValidationRules.password }
      : authValidationRules
  );

  const updateField = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (typeof value === 'string' && touched[field]) {
      validateSingleField(field, value);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setButtonPressed(isLogin ? 'signin' : 'signup');
    
    if (validate(formData)) {
      onSubmit(formData);
    }
  };

  const handleForgotPasswordClick = () => {
    setButtonPressed('forgot');
    onForgotPassword();
    setTimeout(() => setButtonPressed(null), 1000);
  };

  const handlePasswordToggle = () => {
    setButtonPressed('toggle-password');
    setShowPassword(!showPassword);
    setTimeout(() => setButtonPressed(null), 200);
  };

  useEffect(() => {
    if (!loading) {
      setButtonPressed(null);
    }
  }, [loading]);

  useEffect(() => {
    clearErrors();
  }, [isLogin, clearErrors]);

  const isFormValid = () => {
    return formData.email && 
           formData.password.length >= 6 && 
           (isLogin || formData.displayName.trim().length > 0) &&
           Object.values(errors).every(error => !error);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {!isLogin && (
        <>
          <UserTypeSelector
            userType={formData.userType}
            isAdmin={formData.isAdmin}
            onUserTypeChange={(userType) => updateField('userType', userType)}
            onAdminToggle={() => updateField('isAdmin', !formData.isAdmin)}
          />

          <FormField
            id="displayName"
            label="Display Name"
            value={formData.displayName}
            onChange={(value) => updateField('displayName', value)}
            onBlur={() => validateSingleField('displayName', formData.displayName)}
            placeholder="Enter your display name"
            required={!isLogin}
            error={errors.displayName}
            disabled={loading}
          />
        </>
      )}

      <FormField
        id="email"
        label="Email"
        type="email"
        value={formData.email}
        onChange={(value) => updateField('email', value)}
        onBlur={() => validateSingleField('email', formData.email)}
        placeholder="Enter your email address"
        required
        error={errors.email}
        success={touched.email && !errors.email && formData.email ? "✓ Valid email address" : undefined}
        disabled={loading}
      />

      <PasswordField
        id="password"
        label="Password"
        value={formData.password}
        onChange={(value) => updateField('password', value)}
        placeholder="Enter your password"
        required
        error={errors.password}
        showPassword={showPassword}
        onToggleVisibility={handlePasswordToggle}
        isToggling={buttonPressed === 'toggle-password'}
        disabled={loading}
      />

      {!isLogin && formData.userType === 'service_provider' && (
        <FormField
          id="phone"
          label="Phone Number (Optional)"
          type="tel"
          value={formData.phone}
          onChange={(value) => updateField('phone', value)}
          onBlur={() => validateSingleField('phone', formData.phone)}
          placeholder="+1234567890"
          error={errors.phone}
          disabled={loading}
        />
      )}

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
            disabled={buttonPressed === 'forgot' || loading}
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

export default SimpleAuthForm;
