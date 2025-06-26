
import React from 'react';
import AuthHeader from './AuthHeader';
import AuthToggle from './AuthToggle';
import SimpleAuthForm from './SimpleAuthForm';
import AuthFooter from './AuthFooter';
import ForgotPasswordModal from '@/components/ForgotPasswordModal';
import { useAuthForm } from '@/hooks/useAuthForm';
import { useAuthOperations } from '@/hooks/useAuthOperations';
import { useAuthHandlers } from '@/hooks/useAuthHandlers';

const CleanAuthContainer = () => {
  const {
    isLogin,
    setIsLogin,
    showForgotPassword,
    setShowForgotPassword,
  } = useAuthForm();

  const { loading } = useAuthHandlers();
  const { performSignIn, performSignUp, performPasswordReset } = useAuthOperations();

  const handleFormSubmit = async (formData: {
    email: string;
    password: string;
    displayName: string;
    userType: 'user' | 'service_provider';
    isAdmin: boolean;
    phone?: string;
  }) => {
    try {
      if (isLogin) {
        await performSignIn(formData.email, formData.password);
      } else {
        await performSignUp(formData);
      }
    } catch (error) {
      console.error('Auth operation failed:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-purple-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <AuthHeader />

        <div className="bg-black/20 backdrop-blur-md rounded-lg p-6 border border-gray-700">
          <AuthToggle isLogin={isLogin} onToggle={setIsLogin} />

          <SimpleAuthForm
            isLogin={isLogin}
            onSubmit={handleFormSubmit}
            onForgotPassword={() => setShowForgotPassword(true)}
            loading={loading}
          />

          <AuthFooter isLogin={isLogin} onToggle={() => setIsLogin(!isLogin)} />
        </div>
      </div>

      <ForgotPasswordModal
        isOpen={showForgotPassword}
        onClose={() => setShowForgotPassword(false)}
        onForgotPassword={performPasswordReset}
      />
    </div>
  );
};

export default CleanAuthContainer;
