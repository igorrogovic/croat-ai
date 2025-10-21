import React from 'react';
import { Key } from 'lucide-react';
import { ApiKeyModal } from './ApiKeyModal';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  apiKey?: string;
  onApiKeyChange: (apiKey: string) => void;
}

export function SettingsModal({ isOpen, onClose, apiKey, onApiKeyChange }: SettingsModalProps) {
  const [showApiModal, setShowApiModal] = React.useState(false);

  if (!isOpen) {
    return null;
  }

  const hasApiKey = apiKey && apiKey.length > 0;

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 backdrop-blur-sm">
        <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 relative shadow-xl">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
          >
            ×
          </button>
          
          <div className="mb-4">
            <h2 className="text-2xl font-bold text-gray-900">Settings</h2>
            <p className="text-gray-600">Manage your application settings</p>
          </div>

          <div className="space-y-4">
            <button
              onClick={() => setShowApiModal(true)}
              className={`w-full flex items-center justify-between p-4 rounded-md transition-colors ${
                hasApiKey 
                  ? 'bg-green-50 hover:bg-green-100' 
                  : 'bg-red-50 hover:bg-red-100'
              }`}
            >
              <div className="flex items-center">
                <Key className={`h-5 w-5 mr-3 ${hasApiKey ? 'text-green-600' : 'text-red-600'}`} />
                <div>
                  <p className="font-semibold text-gray-800">OpenAI API Key</p>
                  <p className={`text-sm ${hasApiKey ? 'text-green-700' : 'text-red-700'}`}>
                    {hasApiKey ? 'API Key is set' : 'API Key not configured'}
                  </p>
                </div>
              </div>
              <span className="text-sm font-medium text-blue-600 hover:text-blue-700">
                {hasApiKey ? 'Update' : 'Set Key'}
              </span>
            </button>
          </div>
        </div>
      </div>

      <ApiKeyModal
        isOpen={showApiModal}
        onClose={() => setShowApiModal(false)}
        onSave={(newKey) => {
          onApiKeyChange(newKey);
          setShowApiModal(false);
        }}
        currentApiKey={apiKey}
      />
    </>
  );
}