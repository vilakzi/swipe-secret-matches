
import React from 'react';
import FormField from './FormField';
import EmailField from './EmailField';
import PasswordField from './PasswordField';
import UserTypeSelector from './UserTypeSelector';

interface AuthFormFieldsProps {
  isLogin: boolean;
  email: string;
  password: string;
  displayName: string;
  userType: 'user' | 'service_provider';
  isAdmin: boolean;
  showPassword: boolean;
  phone?: string;
  loading: boolean;
  buttonPressed: string | null;
  onEmailChange: (email: string) => void;
  onPasswordChange: (password: string) => void;
  onDisplayNameChange: (name: string) => void;
  onUserTypeChange: (userType: 'user' | 'service_provider') => void;
  onAdminToggle: () => void;
  onPasswordToggle: () => void;
  onPhoneChange?: (phone: string) => void;
}

const AuthFormFields: React.FC<AuthFormFieldsProps> = ({
  isLogin,
  email,
  password,
  displayName,
  userType,
  isAdmin,
  showPassword,
  phone = '',
  loading,
  buttonPressed,
  onEmailChange,
  onPasswordChange,
  onDisplayNameChange,
  onUserTypeChange,
  onAdminToggle,
  onPasswordToggle,
  onPhoneChange,
}) => {
  return (
    <>
      {!isLogin && (
        <>
          <UserTypeSelector
            userType={userType}
            isAdmin={isAdmin}
            onUserTypeChange={onUserTypeChange}
            onAdminToggle={onAdminToggle}
          />

          <FormField
            id="displayName"
            label="Display Name"
            value={displayName}
            onChange={onDisplayNameChange}
            placeholder="Enter your display name"
            required={!isLogin}
            disabled={loading}
          />
        </>
      )}

      <EmailField
        email={email}
        onEmailChange={onEmailChange}
        disabled={loading}
      />

      <PasswordField
        id="password"
        label="Password"
        value={password}
        onChange={onPasswordChange}
        placeholder="Enter your password"
        required
        showPassword={showPassword}
        onToggleVisibility={onPasswordToggle}
        isToggling={buttonPressed === 'toggle-password'}
        disabled={loading}
      />

      {!isLogin && userType === 'service_provider' && onPhoneChange && (
        <FormField
          id="phone"
          label="Phone Number (Optional)"
          type="tel"
          value={phone}
          onChange={onPhoneChange}
          placeholder="+1234567890"
          disabled={loading}
        />
      )}
    </>
  );
};

export default AuthFormFields;
