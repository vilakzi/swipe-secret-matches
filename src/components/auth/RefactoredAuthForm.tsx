
import React, { useEffect } from 'react';
import AuthFormFields from './AuthFormFields';
import AuthFormButtons from './AuthFormButtons';
import { useAuthFormState } from './useAuthFormState';

interface RefactoredAuthFormProps {
  isLogin: boolean;
  loading: boolean;
  onSubmit: (e: React.FormEvent, formData: {
    email: string;
    password: string;
    displayName: string;
    userType: 'user' | 'service_provider';
    isAdmin: boolean;
    phone?: string;
  }) => void;
  onForgotPassword: () => void;
}

const RefactoredAuthForm: React.FC<RefactoredAuthFormProps> = ({
  isLogin,
  loading,
  onSubmit,
  onForgotPassword,
}) => {
  const { formState, formActions, formValidation } = useAuthFormState();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    formActions.setButtonPressed(isLogin ? 'signin' : 'signup');
    
    onSubmit(e, {
      email: formState.email,
      password: formState.password,
      displayName: formState.displayName,
      userType: formState.userType,
      isAdmin: formState.isAdmin,
      phone: formState.phone,
    });
  };

  const handleForgotPasswordClick = () => {
    formActions.setButtonPressed('forgot');
    onForgotPassword();
    setTimeout(() => formActions.resetButtonState(), 1000);
  };

  useEffect(() => {
    if (!loading) {
      formActions.resetButtonState();
    }
  }, [loading, formActions]);

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <AuthFormFields
        isLogin={isLogin}
        email={formState.email}
        password={formState.password}
        displayName={formState.displayName}
        userType={formState.userType}
        isAdmin={formState.isAdmin}
        showPassword={formState.showPassword}
        phone={formState.phone}
        loading={loading}
        buttonPressed={formState.buttonPressed}
        onEmailChange={formActions.setEmail}
        onPasswordChange={formActions.setPassword}
        onDisplayNameChange={formActions.setDisplayName}
        onUserTypeChange={formActions.handleUserTypeChange}
        onAdminToggle={formActions.handleAdminToggle}
        onPasswordToggle={formActions.handlePasswordToggle}
        onPhoneChange={formActions.setPhone}
      />

      <AuthFormButtons
        isLogin={isLogin}
        loading={loading}
        isFormValid={formValidation.isFormValid(isLogin)}
        buttonPressed={formState.buttonPressed}
        onForgotPassword={isLogin ? handleForgotPasswordClick : undefined}
      />
    </form>
  );
};

export default RefactoredAuthForm;
