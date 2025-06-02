
import React from 'react';
import AuthHeader from './AuthHeader';
import AuthToggle from './AuthToggle';
import AuthForm from './AuthForm';
import AuthFooter from './AuthFooter';
import ForgotPasswordModal from '@/components/ForgotPasswordModal';
import { useAuthForm } from '@/hooks/useAuthForm';
import { useAuthHandlers } from '@/hooks/useAuthHandlers';

const AuthContainer = () => {
  const {
    isLogin,
    setIsLogin,
    email,
    setEmail,
    password,
    setPassword,
    displayName,
    setDisplayName,
    userType,
    isAdmin,
    showPassword,
    showForgotPassword,
    setShowForgotPassword,
    handleUserTypeChange,
    handleAdminToggle,
    togglePasswordVisibility,
  } = useAuthForm();

  const { loading, handleSubmit, handleForgotPassword } = useAuthHandlers();

  const onSubmit = (e: React.FormEvent) => {
    handleSubmit(e, isLogin, email, password, displayName, userType, isAdmin);
  };

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
            onSubmit={onSubmit}
            onForgotPassword={() => setShowForgotPassword(true)}
          />

          <AuthFooter isLogin={isLogin} onToggle={() => setIsLogin(!isLogin)} />
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

export default AuthContainer;
