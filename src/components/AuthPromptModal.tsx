import React from 'react';
import { LogIn, UserPlus, ArrowRight } from 'lucide-react';
import { AuthComponent } from './AuthComponent';

interface AuthPromptModalProps {
  onClose: () => void;
  onGuestContinue: () => void;
}

export function AuthPromptModal({ onClose, onGuestContinue }: AuthPromptModalProps) {
  const [authMode, setAuthMode] = React.useState<'signin' | 'signup' | null>(null);

  if (authMode) {
    return <AuthComponent mode={authMode} onClose={() => setAuthMode(null)} />;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 backdrop-blur-sm">
      <div className="bg-white rounded-lg p-8 max-w-lg w-full mx-4 relative text-center shadow-xl">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
        >
          ×
        </button>
        
        <div className="mb-6">
          <h2 className="text-3xl font-bold text-gray-900 mb-3">You're almost there!</h2>
          <p className="text-gray-600 text-lg">
            Create a free account to save your audit history and access results anytime.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <button
            onClick={() => setAuthMode('signup')}
            className="flex-1 inline-flex items-center justify-center px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors font-semibold text-lg"
          >
            <UserPlus className="h-5 w-5 mr-2" />
            Create Account
          </button>
          <button
            onClick={() => setAuthMode('signin')}
            className="flex-1 inline-flex items-center justify-center px-6 py-3 bg-gray-100 text-gray-800 rounded-md hover:bg-gray-200 transition-colors font-semibold text-lg"
          >
            <LogIn className="h-5 w-5 mr-2" />
            Sign In
          </button>
        </div>

        <button
          onClick={onGuestContinue}
          className="text-sm text-gray-500 hover:text-gray-700 inline-flex items-center"
        >
          Continue as guest (results won't be saved)
          <ArrowRight className="h-4 w-4 ml-1" />
        </button>
      </div>
    </div>
  );
}