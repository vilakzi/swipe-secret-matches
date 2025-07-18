
import React from 'react';
import GoogleAuthForm from '@/components/auth/GoogleAuthForm';

console.log('Auth page module loading');

const Auth = () => {
  console.log('Auth component rendering');
  
  try {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#111827' }}>
        <GoogleAuthForm />
      </div>
    );
  } catch (error) {
    console.error('Error rendering Auth component:', error);
    return (
      <div style={{ 
        minHeight: '100vh', 
        backgroundColor: '#111827', 
        color: 'white', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        padding: '2rem'
      }}>
        <div style={{ textAlign: 'center' }}>
          <h1>Auth Error</h1>
          <p>Failed to load authentication form</p>
          <pre style={{ marginTop: '1rem', fontSize: '0.875rem' }}>
            {error instanceof Error ? error.message : 'Unknown error'}
          </pre>
        </div>
      </div>
    );
  }
};

console.log('Auth component defined');

export default Auth;
