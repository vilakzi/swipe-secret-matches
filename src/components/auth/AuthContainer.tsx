
import React from 'react';
import AuthHeader from './AuthHeader';
import AuthToggle from './AuthToggle';
import RefactoredAuthForm from './RefactoredAuthForm';
import AuthFooter from './AuthFooter';
import ForgotPasswordModal from '@/components/ForgotPasswordModal';
import { useAuthForm } from '@/hooks/useAuthForm';
import { useAuthHandlers } from '@/hooks/useAuthHandlers';

const AuthContainer = () => {
  const {
    isLogin,
    setIsLogin,
    showForgotPassword,
    setShowForgotPassword,
  } = useAuthForm();

  const { loading, handleSubmit, handleForgotPassword } = useAuthHandlers();

  const onSubmit = (e: React.FormEvent, formData: {
    email: string;
    password: string;
    displayName: string;
    userType: 'user' | 'service_provider';
    isAdmin: boolean;
    phone?: string;
  }) => {
    handleSubmit(
      e,
      isLogin,
      formData.email,
      formData.password,
      formData.displayName,
      formData.userType,
      formData.isAdmin,
      formData.phone
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-purple-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <AuthHeader />

        <div className="bg-black/20 backdrop-blur-md rounded-lg p-6 border border-gray-700">
          <AuthToggle isLogin={isLogin} onToggle={setIsLogin} />

          <RefactoredAuthForm
            isLogin={isLogin}
            loading={loading}
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
