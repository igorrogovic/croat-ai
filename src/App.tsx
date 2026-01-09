import React, { useState, useEffect } from 'react';
import { useUser } from '@clerk/clerk-react';
import { Header } from './components/Header';
import { LoadingState } from './components/LoadingState';
import { ErrorState } from './components/ErrorState';
import { AuditResults } from './components/AuditResults';
import { AuditHistory } from './components/AuditHistory';
import { AuthPromptModal } from './components/AuthPromptModal';
import { generateAudit } from './utils/auditGenerator';
import { saveAuditResult, loadAuditResult, clearExpiredResults } from './utils/storage';
import { saveUserAuditResult, getUserApiKey, saveUserApiKey } from './utils/userStorage';
import { AuditResult } from './types/audit';
import { Sparkles } from 'lucide-react';

interface FormData {
  websiteUrl: string;
  websiteType: string;
  targetMarket: string;
}

function App() {
  const { isSignedIn, user } = useUser();
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [auditResult, setAuditResult] = useState<AuditResult | null>(null);
  const [formData, setFormData] = useState<FormData>({
    websiteUrl: '',
    websiteType: '',
    targetMarket: '',
  });
  const [apiKey, setApiKey] = useState<string>('');
  const [showAuthPrompt, setShowAuthPrompt] = useState(false);

  useEffect(() => {
    // Clear expired results on app load
    clearExpiredResults();

    // Load API key based on user authentication
    if (isSignedIn && user) {
      // Load user-specific API key
      const userApiKey = getUserApiKey(user.id);
      if (userApiKey) {
        setApiKey(userApiKey);
      }
    } else {
      // Load global API key for non-authenticated users
      const savedApiKey = localStorage.getItem('openai_api_key');
      if (savedApiKey) {
        setApiKey(savedApiKey);
      }
    }
  }, [isSignedIn, user]);

  const handleApiKeyChange = (newApiKey: string) => {
    setApiKey(newApiKey);

    if (isSignedIn && user) {
      // Save user-specific API key
      saveUserApiKey(user.id, newApiKey);
    } else {
      // Save global API key for non-authenticated users
      localStorage.setItem('openai_api_key', newApiKey);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // The original audit generation logic is extracted here so it can be
  // invoked either directly or after the user interacts with the auth prompt.
  const proceedWithAudit = async () => {
    if (!formData.websiteUrl || !formData.websiteType || !formData.targetMarket) return;

    setError(null);
    setShowAuthPrompt(false);

    // Check if we have cached results for this URL
    const cachedResult = loadAuditResult(formData.websiteUrl);
    if (cachedResult &&
        cachedResult.websiteType === formData.websiteType &&
        cachedResult.targetMarket === formData.targetMarket &&
        // Ensure cache includes heuristic analysis if it's supposed to be there
        (cachedResult.heuristicAnalysis && cachedResult.heuristicAnalysis.length > 0)) {
      setAuditResult(cachedResult);
      return;
    }

    const handleProgress = (message: string, progress?: number) => {
      setLoadingMessage(message);
      setLoadingProgress(progress || 0);
    };

    setIsLoading(true);
    setLoadingProgress(0);

    try {
      const result = await generateAudit(
        formData.websiteUrl,
        formData.websiteType,
        formData.targetMarket,
        'default', // Default mode since mode field is removed
        handleProgress,
        apiKey
      );

      // Save to cache (global)
      saveAuditResult(result);

      // Save to user-specific storage if authenticated
      if (isSignedIn && user) {
        // Use user id when available, otherwise fallback to email
        const userId = (user as any).id ?? (user as any).email ?? null;
        if (userId && typeof saveUserAuditResult === 'function') {
          saveUserAuditResult(userId, result);
        }
      }

      setAuditResult(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate audit. Please try again.');
    } finally {
      setIsLoading(false);
      setLoadingMessage('');
    }
  };

  // New form submit flow: if signed in, proceed; otherwise show auth prompt
  const handleFormSubmit = async () => {
    if (!formData.websiteUrl || !formData.websiteType || !formData.targetMarket) return;

    if (isSignedIn) {
      await proceedWithAudit();
    } else {
      setShowAuthPrompt(true);
    }
  };

  const handleRetry = () => {
    handleFormSubmit();
  };

  const handleSelectAudit = (audit: AuditResult) => {
    setAuditResult(audit);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 relative overflow-hidden">
      {/* Background Glass Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-purple-400/15 rounded-full smooth-pulse"
          style={{ filter: 'blur(100px)' }}
        ></div>
      </div>

      {/* Header Section - Full Width and Top */}
      <Header apiKey={apiKey} onApiKeyChange={handleApiKeyChange} />

      <div className="relative z-10 container mx-auto px-4 py-16">
        <main className="py-8">
          <div className="max-w-7xl mx-auto">
            {/* Google Stitch CRO Platform Badge and Headline - Hidden after form submission */}
            {!auditResult && (
              <div className="text-center mb-16">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/20 backdrop-blur-md border border-white/30 mb-6">
                  <Sparkles className="w-4 h-4 text-blue-600" />
                  <span className="text-sm font-medium text-slate-700">C R O / A T</span>
                </div>

                <h1 className="text-6xl font-light text-slate-900 mb-6 tracking-tight">
                  Conversion Rate
                  <br />
                  <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent font-medium">
                    Optimization
                  </span>
                </h1>

                <p className="text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
                  Analyze your website's conversion potential with AI-powered insights and prioritize A/B tests using the PXL
                  framework.
                </p>
              </div>
            )}

            {/* Form Section */}
            {!auditResult && (
              <div className="mb-12">
                <div className="max-w-2xl mx-auto p-8 bg-white/40 backdrop-blur-xl border border-white/50 shadow-2xl shadow-blue-500/10 rounded-md">
                  <div className="space-y-6">
                    <div className="relative">
                      <input
                        type="url"
                        name="websiteUrl"
                        placeholder="Enter your website URL (e.g., https://example.com)"
                        value={formData.websiteUrl}
                        onChange={handleInputChange}
                        className="h-14 text-lg bg-white/50 backdrop-blur-sm border border-white/60 focus:bg-white/70 transition-all duration-300 w-full pl-4 pr-4 rounded-md"
                      />
                    </div>
                    <div className="relative">
                      <input
                        type="text"
                        name="websiteType"
                        placeholder="Enter website type (e.g., e-commerce, lead gen)"
                        value={formData.websiteType}
                        onChange={handleInputChange}
                        className="h-14 text-lg bg-white/50 backdrop-blur-sm border border-white/60 focus:bg-white/70 transition-all duration-300 w-full pl-4 pr-4 rounded-md"
                      />
                    </div>
                    <div className="relative">
                      <input
                        type="text"
                        name="targetMarket"
                        placeholder="Enter target market (e.g., US)"
                        value={formData.targetMarket}
                        onChange={handleInputChange}
                        className="h-14 text-lg bg-white/50 backdrop-blur-sm border border-white/60 focus:bg-white/70 transition-all duration-300 w-full pl-4 pr-4 rounded-md"
                      />
                    </div>
                    <button
                      onClick={handleFormSubmit}
                      disabled={!formData.websiteUrl || !formData.websiteType || !formData.targetMarket || isLoading}
                      className="w-full h-14 text-lg font-medium bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg shadow-blue-500/25 transition-all duration-300 disabled:opacity-50 text-white rounded-md"
                    >
                      {isLoading ? (
                        <div className="flex items-center gap-2 justify-center">
                          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                          Analyzing Website...
                        </div>
                      ) : (
                        "Start CRO Analysis"
                      )}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Audit History Section - Only show when not loading and no current result */}
            {!auditResult && !isLoading && (
              <div className="mb-12">
                <AuditHistory onSelectAudit={handleSelectAudit} />
              </div>
            )}

            {/* Loading State */}
            {isLoading && <LoadingState message={loadingMessage} progress={loadingProgress} />}

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
                      setFormData({ websiteUrl: '', websiteType: '', targetMarket: '' });
                    }}
                    className="text-primary hover:text-primary/80 font-medium transition-colors flex items-center gap-2"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="m12 19-7-7 7-7"/>
                      <path d="M19 12H5"/>
                    </svg>
                    Analyze Another Website
                  </button>
                </div>

                <AuditResults result={auditResult} />
              </div>
            )}

            {/* Auth Prompt Modal */}
            {showAuthPrompt && (
              <AuthPromptModal
                onClose={() => setShowAuthPrompt(false)}
                onGuestContinue={proceedWithAudit}
              />
            )}
          </div>
        </main>

        {/* Footer */}
        <footer className="left-0 right-0 w-full sm:px-6 lg:px-8 mt-16">
          <div className="max-w-7xl mx-auto text-center">
            <p className="text-muted-foreground text-sm">
              CRO Analysis Tool • Powered by AI
            </p>
            <p className="text-muted-foreground/70 text-xs mt-1">
              Recommendations based on UX best practices and conversion optimization principles
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
}

export default App;