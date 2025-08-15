import { useState } from 'react';

export const usePostFetching = () => {
  const [posts] = useState([]);
  const [loading] = useState(false);
  const [error] = useState(null);

  return { posts, loading, error, refetch: () => {} };
};