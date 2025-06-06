
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Eye, EyeOff, Loader2, Shield } from 'lucide-react';
import { useSecureAuth } from '@/hooks/useSecureAuth';
import { validateEmailSecurity } from '@/utils/enhancedEmailValidation';
import { sanitizeInput, validatePhoneNumber } from '@/utils/inputSanitization';

interface SecureAuthFormProps {
  isLogin: boolean;
  onToggle: () => void;
}

const SecureAuthForm: React.FC<SecureAuthFormProps> = ({ isLogin, onToggle }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    displayName: '',
    phone: '',
    userType: 'user' as 'user' | 'service_provider'
  });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const { loading, secureSignIn, secureSignUp } = useSecureAuth();

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    // Email validation
    const emailValidation = validateEmailSecurity(formData.email);
    if (!emailValidation.isValid) {
      newErrors.email = emailValidation.error || 'Invalid email';
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (!isLogin && formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }

    // Display name validation (only for signup)
    if (!isLogin) {
      const sanitizedName = sanitizeInput(formData.displayName);
      if (!sanitizedName || sanitizedName.length < 2) {
        newErrors.displayName = 'Display name must be at least 2 characters';
      }

      // Phone validation (optional)
      if (formData.phone) {
        const phoneValidation = validatePhoneNumber(formData.phone);
        if (!phoneValidation.isValid) {
          newErrors.phone = phoneValidation.error || 'Invalid phone number';
        }
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    if (isLogin) {
      await secureSignIn(formData.email, formData.password);
    } else {
      await secureSignUp(
        formData.email,
        formData.password,
        formData.displayName,
        formData.userType,
        formData.phone
      );
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="flex items-center space-x-2 text-green-600 mb-4">
        <Shield className="w-5 h-5" />
        <span className="text-sm font-medium">Secure Authentication</span>
      </div>

      {!isLogin && (
        <div>
          <Label htmlFor="displayName">Display Name</Label>
          <Input
            id="displayName"
            value={formData.displayName}
            onChange={(e) => setFormData(prev => ({ 
              ...prev, 
              displayName: sanitizeInput(e.target.value) 
            }))}
            className={errors.displayName ? 'border-red-500' : ''}
            maxLength={50}
          />
          {errors.displayName && (
            <p className="text-red-500 text-sm mt-1">{errors.displayName}</p>
          )}
        </div>
      )}

      <div>
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          value={formData.email}
          onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value.trim() }))}
          className={errors.email ? 'border-red-500' : ''}
          maxLength={254}
        />
        {errors.email && (
          <p className="text-red-500 text-sm mt-1">{errors.email}</p>
        )}
      </div>

      <div>
        <Label htmlFor="password">Password</Label>
        <div className="relative">
          <Input
            id="password"
            type={showPassword ? 'text' : 'password'}
            value={formData.password}
            onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
            className={`pr-10 ${errors.password ? 'border-red-500' : ''}`}
            maxLength={128}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 transform -translate-y-1/2"
          >
            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
        {errors.password && (
          <p className="text-red-500 text-sm mt-1">{errors.password}</p>
        )}
      </div>

      {!isLogin && (
        <div>
          <Label htmlFor="phone">Phone (Optional)</Label>
          <Input
            id="phone"
            type="tel"
            value={formData.phone}
            onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
            className={errors.phone ? 'border-red-500' : ''}
            placeholder="+1234567890"
            maxLength={20}
          />
          {errors.phone && (
            <p className="text-red-500 text-sm mt-1">{errors.phone}</p>
          )}
        </div>
      )}

      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            {isLogin ? 'Signing in...' : 'Creating account...'}
          </>
        ) : (
          isLogin ? 'Sign In' : 'Create Account'
        )}
      </Button>

      <div className="text-center">
        <button
          type="button"
          onClick={onToggle}
          className="text-sm text-blue-600 hover:underline"
        >
          {isLogin ? 'Need an account? Sign up' : 'Already have an account? Sign in'}
        </button>
      </div>
    </form>
  );
};

export default SecureAuthForm;
