
import { useState, useCallback } from 'react';

export const useAuthForm = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [userType, setUserType] = useState<'user' | 'service_provider'>('user');
  const [isAdmin, setIsAdmin] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);

  const handleUserTypeChange = useCallback((newUserType: 'user' | 'service_provider') => {
    setUserType(newUserType);
    setIsAdmin(false);
  }, []);

  const handleAdminToggle = useCallback(() => {
    setIsAdmin(!isAdmin);
  }, [isAdmin]);

  const togglePasswordVisibility = useCallback(() => {
    setShowPassword(!showPassword);
  }, [showPassword]);

  return {
    isLogin,
    setIsLogin,
    email,
    setEmail,
    password,
    setPassword,
    displayName,
    setDisplayName,
    userType,
    setUserType,
    isAdmin,
    setIsAdmin,
    showPassword,
    setShowPassword,
    showForgotPassword,
    setShowForgotPassword,
    handleUserTypeChange,
    handleAdminToggle,
    togglePasswordVisibility,
  };
};
