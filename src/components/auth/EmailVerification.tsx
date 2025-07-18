
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Mail, CheckCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface EmailVerificationProps {
  email: string;
  onResend?: () => void;
}

const EmailVerification = ({ email, onResend }: EmailVerificationProps) => {
  const { signOut } = useAuth();

  return (
    <Card className="w-full max-w-md mx-auto bg-black/20 backdrop-blur-md border-gray-700">
      <CardHeader className="text-center">
        <div className="flex justify-center mb-4">
          <Mail className="w-16 h-16 text-purple-500" />
        </div>
        <CardTitle className="text-white">Check Your Email</CardTitle>
      </CardHeader>
      <CardContent className="text-center space-y-4">
        <p className="text-gray-300">
          We've sent a verification link to:
        </p>
        <p className="text-white font-semibold break-all">{email}</p>
        
        <div className="bg-gray-800/50 border border-gray-600 rounded-lg p-4">
          <div className="flex items-center justify-center mb-2">
            <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
            <span className="text-green-400 font-medium">Next Steps</span>
          </div>
          <ul className="text-gray-300 text-sm space-y-1">
            <li>1. Check your email inbox</li>
            <li>2. Click the verification link</li>
            <li>3. Return here to continue</li>
          </ul>
        </div>

        <div className="space-y-2">
          {onResend && (
            <Button
              onClick={onResend}
              variant="outline"
              className="w-full border-gray-600 text-gray-300 hover:bg-gray-800"
            >
              Resend Email
            </Button>
          )}
          <Button
            onClick={signOut}
            variant="ghost"
            className="w-full text-gray-400 hover:text-white"
          >
            Use Different Email
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default EmailVerification;
