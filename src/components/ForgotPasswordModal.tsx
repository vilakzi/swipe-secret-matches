
import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Mail } from 'lucide-react';
import { validateEmail } from '@/utils/emailValidation';

interface ForgotPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  onForgotPassword: (email: string) => Promise<void>;
}

const ForgotPasswordModal: React.FC<ForgotPasswordModalProps> = ({
  isOpen,
  onClose,
  onForgotPassword,
}) => {
  const [email, setEmail] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [emailError, setEmailError] = React.useState<string | null>(null);
  const [emailTouched, setEmailTouched] = React.useState(false);

  // Validate email on change
  React.useEffect(() => {
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
    setEmail(value);
    if (!emailTouched) {
      setEmailTouched(true);
    }
  };

  const handleEmailBlur = () => {
    setEmailTouched(true);
  };

  const isFormValid = () => {
    const emailValidation = validateEmail(email);
    return emailValidation.isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isFormValid()) {
      setEmailTouched(true);
      return;
    }

    setLoading(true);
    try {
      await onForgotPassword(email);
      setEmail('');
      setEmailTouched(false);
      setEmailError(null);
      onClose();
    } catch (error) {
      console.error('Error in forgot password:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setEmail('');
    setEmailTouched(false);
    setEmailError(null);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="bg-black/90 backdrop-blur-md border border-gray-700 text-white">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2 text-white">
            <Mail className="w-5 h-5" />
            <span>Reset Password</span>
          </DialogTitle>
          <DialogDescription className="text-gray-400">
            Enter your email address and we'll send you a link to reset your password.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Email Address
            </label>
            <Input
              type="email"
              value={email}
              onChange={(e) => handleEmailChange(e.target.value)}
              onBlur={handleEmailBlur}
              className={`bg-gray-800 border-gray-600 text-white ${
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
          
          <div className="flex space-x-3">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              className="flex-1 border-gray-600 text-gray-300 hover:bg-gray-700"
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-purple-600 hover:bg-purple-700 disabled:opacity-50"
              disabled={loading || !isFormValid()}
            >
              {loading ? "Sending..." : "Send Reset Link"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ForgotPasswordModal;
