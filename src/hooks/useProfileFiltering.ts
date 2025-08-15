import { useMemo } from 'react';

export const useProfileFiltering = () => {
  const userRole = {
    role: 'user',
    isAdmin: false,
    isServiceProvider: false,
    loading: false,
    isUser: true
  };

  return { userRole };
};