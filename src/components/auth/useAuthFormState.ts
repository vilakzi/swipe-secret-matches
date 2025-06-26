
import { useState, useEffect, useCallback } from 'react';
import { validateEmail } from '@/utils/emailValidation';

export const useAuthFormState = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [userType, setUserType] = useState<'user' | 'service_provider'>('user');
  const [isAdmin, setIsAdmin] = useState(false);
  const [phone, setPhone] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [buttonPressed, setButtonPressed] = useState<string | null>(null);

  const handleUserTypeChange = useCallback((newUserType: 'user' | 'service_provider') => {
    setUserType(newUserType);
    setIsAdmin(false);
  }, []);

  const handleAdminToggle = useCallback(() => {
    setIsAdmin(!isAdmin);
  }, [isAdmin]);

  const handlePasswordToggle = useCallback(() => {
    setButtonPressed('toggle-password');
    setShowPassword(!showPassword);
    setTimeout(() => setButtonPressed(null), 200);
  }, [showPassword]);

  const isFormValid = useCallback((isLogin: boolean) => {
    const emailValidation = validateEmail(email);
    return emailValidation.isValid && 
           password.length >= 6 && 
           (isLogin || displayName.trim().length > 0);
  }, [email, password, displayName]);

  const resetButtonState = useCallback(() => {
    setButtonPressed(null);
  }, []);

  return {
    formState: {
      email,
      password,
      displayName,
      userType,
      isAdmin,
      phone,
      showPassword,
      buttonPressed,
    },
    formActions: {
      setEmail,
      setPassword,
      setDisplayName,
      setUserType,
      setIsAdmin,
      setPhone,
      setShowPassword,
      setButtonPressed,
      handleUserTypeChange,
      handleAdminToggle,
      handlePasswordToggle,
      resetButtonState,
    },
    formValidation: {
      isFormValid,
    },
  };
};
