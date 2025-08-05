
import * as React from 'react';
import FormField from './FormField';
import { validateEmail } from '@/utils/emailValidation';

interface EmailFieldProps {
  email: string;
  onEmailChange: (email: string) => void;
  disabled?: boolean;
}

const EmailField: React.FC<EmailFieldProps> = ({
  email,
  onEmailChange,
  disabled = false,
}) => {
  const [emailError, setEmailError] = React.useState<string | null>(null);
  const [emailTouched, setEmailTouched] = React.useState(false);

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
    onEmailChange(value);
    if (!emailTouched) {
      setEmailTouched(true);
    }
  };

  const handleEmailBlur = () => {
    setEmailTouched(true);
  };

  return (
    <FormField
      id="email"
      label="Email"
      type="email"
      value={email}
      onChange={handleEmailChange}
      onBlur={handleEmailBlur}
      placeholder="Enter your email address"
      required
      error={emailError || undefined}
      success={emailTouched && !emailError && email ? "✓ Valid email address" : undefined}
      disabled={disabled}
    />
  );
};

export default EmailField;
