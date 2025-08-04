
import * as React from 'react';
import { Heart } from 'lucide-react';

const AuthHeader = () => {
  return (
    <div className="text-center mb-8">
      <Heart className="w-12 h-12 text-pink-500 mx-auto mb-4" />
      <h1 className="text-3xl font-bold text-white mb-2">Connect</h1>
      <p className="text-gray-400">Find your perfect match</p>
    </div>
  );
};

export default AuthHeader;
