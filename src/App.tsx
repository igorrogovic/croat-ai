import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { OnboardingTooltip } from './components/OnboardingTooltip';
import { AuditForm } from './components/AuditForm';
import { LoadingState } from './components/LoadingState';
import { ErrorState } from './components/ErrorState';
import { AuditResults } from './components/AuditResults';
import { generateAudit } from './utils/auditGenerator';
import { saveAuditResult, loadAuditResult, clearExpiredResults } from './utils/storage';
import { AuditResult } from './types/audit';

interface FormData {
  websiteUrl: string;
  websiteType: string;
  targetMarket: string;
  mode: string;
}

function App() {
  const [showTooltip, setShowTooltip] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [auditResult, setAuditResult] = useState<AuditResult | null>(null);
  const [lastFormData, setLastFormData] = useState<FormData | null>(null);
  const [apiKey, setApiKey] = useState<string>('');

  useEffect(() => {
    // Clear expired results on app load
    clearExpiredResults();
    
    // Check if tooltip was previously dismissed
    const tooltipDismissed = localStorage.getItem('cro_tooltip_dismissed');
    if (tooltipDismissed === 'true') {
      setShowTooltip(false);
    }

    // Load saved API key
    const savedApiKey = localStorage.getItem('openai_api_key');
    if (savedApiKey) {
      setApiKey(savedApiKey);
    }
  }, []);

  const handleApiKeyChange = (newApiKey: string) => {
    setApiKey(newApiKey);
    localStorage.setItem('openai_api_key', newApiKey);
  };

  const handleTooltipDismiss = () => {
    setShowTooltip(false);
    localStorage.setItem('cro_tooltip_dismissed', 'true');
  };

  const handleFormSubmit = async (formData: FormData) => {
    setLastFormData(formData);
    setError(null);
    
    // Check if we have cached results for this URL
    const cachedResult = loadAuditResult(formData.websiteUrl);
    if (cachedResult && 
        cachedResult.websiteType === formData.websiteType &&
        cachedResult.targetMarket === formData.targetMarket &&
        cachedResult.mode === formData.mode) {
      setAuditResult(cachedResult);
      return;
    }

    setIsLoading(true);
    
    try {
      const result = await generateAudit(
        formData.websiteUrl,
        formData.websiteType,
        formData.targetMarket,
        formData.mode,
        setLoadingMessage,
        apiKey
      );
      
      // Save to cache
      saveAuditResult(result);
      setAuditResult(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate audit. Please try again.');
    } finally {
      setIsLoading(false);
      setLoadingMessage('');
    }
  };

  const handleRetry = () => {
    if (lastFormData) {
      handleFormSubmit(lastFormData);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Header apiKey={apiKey} onApiKeyChange={handleApiKeyChange} />
      
      <main className="py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* API Key Notice */}
          {!apiKey && !auditResult && (
            <div className="max-w-md mx-auto mb-6">
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-yellow-800">
                      OpenAI API Key Required
                    </h3>
                    <div className="mt-2 text-sm text-yellow-700">
                      <p>
                        To generate real CRO audits, please configure your OpenAI API key using the "Set API Key" button above. 
                        Without an API key, you'll see demo recommendations only.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Onboarding Tooltip */}
          {showTooltip && !auditResult && (
            <div className="max-w-md mx-auto mb-8">
              <OnboardingTooltip onDismiss={handleTooltipDismiss} />
            </div>
          )}

          {/* Form Section */}
          {!auditResult && (
            <div className="mb-12">
              <AuditForm onSubmit={handleFormSubmit} isLoading={isLoading} />
            </div>
          )}

          {/* Loading State */}
          {isLoading && <LoadingState message={loadingMessage} />}

          {/* Error State */}
          {error && <ErrorState message={error} onRetry={handleRetry} />}

          {/* Results */}
          {auditResult && !isLoading && !error && (
            <div>
              {/* Back to Form Button */}
              <div className="mb-6">
                <button
                  onClick={() => {
                    setAuditResult(null);
                    setError(null);
                  }}
                  className="text-blue-600 hover:text-blue-800 font-medium transition-colors"
                >
                  ← Analyze Another Website
                </button>
              </div>
              
              <AuditResults result={auditResult} />
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-8 px-4 sm:px-6 lg:px-8 mt-16">
        <div className="max-w-7xl mx-auto text-center">
          <p className="text-gray-600 text-sm">
            Professional CRO Analysis Tool • Powered by OpenAI GPT-4
          </p>
          <p className="text-gray-500 text-xs mt-1">
            Recommendations based on UX best practices and conversion optimization principles
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;