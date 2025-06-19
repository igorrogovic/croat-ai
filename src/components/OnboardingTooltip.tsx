import React from 'react';
import { X, Lightbulb } from 'lucide-react';

interface OnboardingTooltipProps {
  onDismiss: () => void;
}

export const OnboardingTooltip: React.FC<OnboardingTooltipProps> = ({ onDismiss }) => {
  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 relative" role="alert">
      <button
        onClick={onDismiss}
        className="absolute top-2 right-2 text-blue-400 hover:text-blue-600 transition-colors"
        aria-label="Dismiss tooltip"
      >
        <X className="h-4 w-4" />
      </button>
      <div className="flex items-start space-x-3">
        <Lightbulb className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
        <div>
          <h3 className="text-blue-900 font-medium">Welcome to the CRO Audit Tool!</h3>
          <p className="text-blue-800 text-sm mt-1">
            Enter your website details below to get a comprehensive conversion rate optimization audit 
            with actionable recommendations, quick wins, and A/B test suggestions.
          </p>
        </div>
      </div>
    </div>
  );
};