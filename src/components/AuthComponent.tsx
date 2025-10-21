import React from 'react';
import { SignIn, SignUp, useUser, UserButton } from '@clerk/clerk-react';
import { LogIn, UserPlus } from 'lucide-react';

interface AuthComponentProps {
  mode: 'signin' | 'signup' | 'profile';
  onClose?: () => void;
}

export function AuthComponent({ mode, onClose }: AuthComponentProps) {
  const { isSignedIn, user } = useUser();

  if (isSignedIn && mode === 'profile') {
    return (
      <div className="flex items-center gap-3">
        <span className="text-sm text-gray-600">
          Welcome, {user.firstName || user.emailAddresses[0].emailAddress}
        </span>
        <UserButton afterSignOutUrl="/" />
      </div>
    );
  }

  if (mode === 'signin') {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 relative">
          {onClose && (
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
            >
              ×
            </button>
          )}
          <div className="mb-4">
            <h2 className="text-2xl font-bold text-center mb-2">Sign In</h2>
            <p className="text-gray-600 text-center">
              Access your CRO audit history and saved results
            </p>
          </div>
          <SignIn 
            routing="hash" 
            afterSignInUrl="/"
            appearance={{
              elements: {
                formButtonPrimary: 'bg-blue-600 hover:bg-blue-700',
                card: 'shadow-none',
              }
            }}
          />
        </div>
      </div>
    );
  }

  if (mode === 'signup') {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 relative">
          {onClose && (
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
            >
              ×
            </button>
          )}
          <div className="mb-4">
            <h2 className="text-2xl font-bold text-center mb-2">Sign Up</h2>
            <p className="text-gray-600 text-center">
              Create an account to save and track your CRO audits
            </p>
          </div>
          <SignUp 
            routing="hash" 
            afterSignUpUrl="/"
            appearance={{
              elements: {
                formButtonPrimary: 'bg-blue-600 hover:bg-blue-700',
                card: 'shadow-none',
              }
            }}
          />
        </div>
      </div>
    );
  }

  return null;
}