import React, { useState } from 'react';
import { BarChart3, Settings, Key } from 'lucide-react';
import { ApiKeyModal } from './ApiKeyModal';

interface HeaderProps {
  apiKey?: string;
  onApiKeyChange: (apiKey: string) => void;
}

export const Header: React.FC<HeaderProps> = ({ apiKey, onApiKeyChange }) => {
  const [showApiModal, setShowApiModal] = useState(false);

  const hasApiKey = apiKey && apiKey.length > 0;

  return (
    <>
      <header className="sticky top-0 bg-white shadow-sm border-b border-gray-200 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-600 rounded-lg">
                <BarChart3 className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">CRO Audit Tool</h1>
                <p className="text-sm text-gray-600">Professional Conversion Rate Optimization Analysis</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="hidden md:flex items-center space-x-2">
                <div className={`w-2 h-2 rounded-full ${hasApiKey ? 'bg-green-500' : 'bg-red-500'}`}></div>
                <span className="text-sm text-gray-500">
                  {hasApiKey ? 'API Connected' : 'API Not Configured'}
                </span>
              </div>
              <button
                onClick={() => setShowApiModal(true)}
                className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  hasApiKey 
                    ? 'bg-green-100 text-green-800 hover:bg-green-200' 
                    : 'bg-red-100 text-red-800 hover:bg-red-200'
                }`}
                aria-label="Configure API Key"
              >
                <Key className="h-4 w-4" />
                <span className="hidden sm:inline">
                  {hasApiKey ? 'API Key Set' : 'Set API Key'}
                </span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <ApiKeyModal
        isOpen={showApiModal}
        onClose={() => setShowApiModal(false)}
        onSave={onApiKeyChange}
        currentApiKey={apiKey}
      />
    </>
  );
};