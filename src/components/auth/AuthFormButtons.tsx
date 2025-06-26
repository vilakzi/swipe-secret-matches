
import React from 'react';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

interface AuthFormButtonsProps {
  isLogin: boolean;
  loading: boolean;
  isFormValid: boolean;
  buttonPressed: string | null;
  onForgotPassword?: () => void;
}

const AuthFormButtons: React.FC<AuthFormButtonsProps> = ({
  isLogin,
  loading,
  isFormValid,
  buttonPressed,
  onForgotPassword,
}) => {
  return (
    <>
      {isLogin && onForgotPassword && (
        <div className="flex justify-end">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className={`text-purple-400 hover:text-purple-300 p-0 h-auto transition-all duration-200 ${
              buttonPressed === 'forgot' ? 'text-purple-300 underline' : ''
            }`}
            onClick={onForgotPassword}
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
        disabled={loading || !isFormValid}
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
    </>
  );
};

export default AuthFormButtons;
