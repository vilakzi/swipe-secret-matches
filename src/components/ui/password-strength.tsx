import React from 'react';
import { Progress } from '@/components/ui/progress';

interface PasswordStrengthProps {
  password: string;
}

const PasswordStrength: React.FC<PasswordStrengthProps> = ({ password }) => {
  const calculateStrength = (pwd: string): { strength: number; message: string } => {
    let strength = 0;
    const checks = {
      length: pwd.length >= 8,
      hasNumber: /\d/.test(pwd),
      hasLower: /[a-z]/.test(pwd),
      hasUpper: /[A-Z]/.test(pwd),
      hasSpecial: /[!@#$%^&*(),.?":{}|<>]/.test(pwd)
    };

    // Add 20 points for each passing check
    Object.values(checks).forEach(check => {
      if (check) strength += 20;
    });

    let message = '';
    if (strength <= 20) message = 'Very Weak';
    else if (strength <= 40) message = 'Weak';
    else if (strength <= 60) message = 'Fair';
    else if (strength <= 80) message = 'Strong';
    else message = 'Very Strong';

    return { strength, message };
  };

  const { strength, message } = calculateStrength(password);

  const getStrengthColor = (str: number): string => {
    if (str <= 20) return 'bg-red-500';
    if (str <= 40) return 'bg-orange-500';
    if (str <= 60) return 'bg-yellow-500';
    if (str <= 80) return 'bg-lime-500';
    return 'bg-green-500';
  };

  return (
    <div className="space-y-2">
      <Progress
        value={strength}
        className="h-2"
        indicatorClassName={getStrengthColor(strength)}
      />
      <p className={`text-sm ${getStrengthColor(strength).replace('bg-', 'text-')}`}>
        Password Strength: {message}
      </p>
      {strength < 60 && (
        <ul className="text-xs text-gray-500 list-disc list-inside">
          <li>Use 8 or more characters</li>
          <li>Include numbers</li>
          <li>Include lowercase letters</li>
          <li>Include uppercase letters</li>
          <li>Include special characters</li>
        </ul>
      )}
    </div>
  );
};

export default PasswordStrength;