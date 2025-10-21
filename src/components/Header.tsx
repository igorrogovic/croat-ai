import React from 'react';
import { SignedIn, SignedOut, SignInButton, SignUpButton, UserButton } from '@clerk/clerk-react';
import { LogIn, UserPlus, Key, Settings } from 'lucide-react';
import { ApiKeyModal } from './ApiKeyModal';
import { SettingsModal } from './SettingsModal';

interface HeaderProps {
  apiKey?: string;
  onApiKeyChange: (apiKey: string) => void;
}

export function Header({ apiKey, onApiKeyChange }: HeaderProps) {
  const [showApiModal, setShowApiModal] = React.useState(false);
  const [showSettingsModal, setShowSettingsModal] = React.useState(false);

  return (
    <>
      <header className="absolute top-0 left-0 right-0 z-20">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="text-lg font-bold text-slate-800"></div>
          <div className="flex items-center gap-4">
            <SignedOut>
              <button
                onClick={() => setShowApiModal(true)}
                className="hidden sm:inline-flex items-center gap-2 px-4 py-2 rounded-md bg-white/50 backdrop-blur-sm border border-white/60 hover:bg-white/70 transition-colors"
              >
                <Key className="w-4 h-4 text-slate-600" />
                <span className="text-sm font-medium text-slate-700">Set API Key</span>
              </button>
              <SignInButton mode="modal">
                <button className="text-sm font-medium text-slate-700 hover:text-blue-600">
                  Sign In
                </button>
              </SignInButton>
              <SignUpButton mode="modal">
                <button className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700 transition-colors">
                  <UserPlus className="w-4 h-4" />
                  <span className="text-sm font-medium">Sign Up</span>
                </button>
              </SignUpButton>
            </SignedOut>
            <SignedIn>
              <button
                onClick={() => setShowSettingsModal(true)}
                className="p-2 rounded-full bg-white/50 backdrop-blur-sm border border-white/60 hover:bg-white/70 transition-colors"
              >
                <Settings className="w-5 h-5 text-slate-600" />
              </button>
              <UserButton afterSignOutUrl="/" />
            </SignedIn>
          </div>
        </div>
      </header>

      <SignedOut>
        <ApiKeyModal
          isOpen={showApiModal}
          onClose={() => setShowApiModal(false)}
          onSave={onApiKeyChange}
          currentApiKey={apiKey}
        />
      </SignedOut>
      
      <SignedIn>
        <SettingsModal
          isOpen={showSettingsModal}
          onClose={() => setShowSettingsModal(false)}
          apiKey={apiKey}
          onApiKeyChange={onApiKeyChange}
        />
      </SignedIn>
    </>
  );
}