import React, { useState } from 'react';
import { useUser } from '@clerk/clerk-react';
import { Lock, LogIn } from 'lucide-react';
import { AuthComponent } from './AuthComponent';

interface ProtectedFeatureProps {
  children: React.ReactNode;
  featureName: string;
  description?: string;
}

export function ProtectedFeature({ children, featureName, description }: ProtectedFeatureProps) {
  const { isSignedIn } = useUser();
  const [showAuth, setShowAuth] = useState(false);

  if (isSignedIn) {
    return <>{children}</>;
  }

  return (
    <>
      <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
        <Lock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Sign in to access {featureName}
        </h3>
        {description && (
          <p className="text-gray-600 mb-4">{description}</p>
        )}
        <button
          onClick={() => setShowAuth(true)}
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          <LogIn className="h-4 w-4 mr-2" />
          Sign In to Continue
        </button>
      </div>

      {showAuth && (
        <AuthComponent mode="signin" onClose={() => setShowAuth(false)} />
      )}
    </>
  );
}