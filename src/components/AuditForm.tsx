import React, { useState, useEffect, useMemo } from 'react';
import { Check, AlertCircle, Globe, Target, Zap } from 'lucide-react';
import { validateUrl, validateTargetMarket, validateWebsiteType } from '../utils/validation';

interface AuditFormProps {
  onSubmit: (data: {
    websiteUrl: string;
    websiteType: string;
    targetMarket: string;
    mode: string;
  }) => void;
  isLoading: boolean;
}

interface ValidationState {
  websiteUrl: boolean | null;
  websiteType: boolean | null;
  targetMarket: boolean | null;
}

export const AuditForm: React.FC<AuditFormProps> = ({ onSubmit, isLoading }) => {
  const [formData, setFormData] = useState({
    websiteUrl: '',
    websiteType: '',
    targetMarket: '',
    mode: 'Basic'
  });
  
  const [validation, setValidation] = useState<ValidationState>({
    websiteUrl: null,
    websiteType: null,
    targetMarket: null
  });

  // Debounced validation
  useEffect(() => {
    const timer = setTimeout(() => {
      setValidation({
        websiteUrl: formData.websiteUrl ? validateUrl(formData.websiteUrl) : null,
        websiteType: formData.websiteType ? validateWebsiteType(formData.websiteType) : null,
        targetMarket: formData.targetMarket ? validateTargetMarket(formData.targetMarket) : null
      });
    }, 500);

    return () => clearTimeout(timer);
  }, [formData]);

  const isFormValid = useMemo(() => {
    return validation.websiteUrl === true && 
           validation.websiteType === true && 
           validation.targetMarket === true;
  }, [validation]);

  const handleSubmit = () => {
    if (isFormValid && !isLoading) {
      onSubmit(formData);
    }
  };

  const handleClear = () => {
    setFormData({
      websiteUrl: '',
      websiteType: '',
      targetMarket: '',
      mode: 'Basic'
    });
    setValidation({
      websiteUrl: null,
      websiteType: null,
      targetMarket: null
    });
  };

  const getValidationIcon = (isValid: boolean | null) => {
    if (isValid === null) return null;
    return isValid ? (
      <Check className="h-4 w-4 text-green-600" />
    ) : (
      <AlertCircle className="h-4 w-4 text-red-600" />
    );
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 max-w-md mx-auto">
      <div className="space-y-6">
        {/* Website Type */}
        <div>
          <label htmlFor="websiteType" className="block text-sm font-medium text-gray-700 mb-2">
            <Globe className="inline h-4 w-4 mr-2" />
            Website Type
          </label>
          <div className="relative">
            <select
              id="websiteType"
              value={formData.websiteType}
              onChange={(e) => setFormData(prev => ({ ...prev, websiteType: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-10"
              aria-label="Website Type"
              disabled={isLoading}
            >
              <option value="">Select website type...</option>
              <option value="E-commerce">E-commerce</option>
              <option value="Lead Generation">Lead Generation</option>
            </select>
            <div className="absolute inset-y-0 right-8 flex items-center">
              {getValidationIcon(validation.websiteType)}
            </div>
          </div>
          {validation.websiteType === false && (
            <p className="text-red-600 text-sm mt-1">Please select a website type</p>
          )}
        </div>

        {/* Website URL */}
        <div>
          <label htmlFor="websiteUrl" className="block text-sm font-medium text-gray-700 mb-2">
            <Target className="inline h-4 w-4 mr-2" />
            Website URL
          </label>
          <div className="relative">
            <input
              type="url"
              id="websiteUrl"
              value={formData.websiteUrl}
              onChange={(e) => setFormData(prev => ({ ...prev, websiteUrl: e.target.value }))}
              placeholder="https://example.com"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-10"
              aria-label="Website URL"
              disabled={isLoading}
            />
            <div className="absolute inset-y-0 right-3 flex items-center">
              {getValidationIcon(validation.websiteUrl)}
            </div>
          </div>
          {validation.websiteUrl === false && (
            <p className="text-red-600 text-sm mt-1">Please enter a valid URL starting with http:// or https://</p>
          )}
        </div>

        {/* Target Market */}
        <div>
          <label htmlFor="targetMarket" className="block text-sm font-medium text-gray-700 mb-2">
            <Zap className="inline h-4 w-4 mr-2" />
            Target Market
          </label>
          <div className="relative">
            <input
              type="text"
              id="targetMarket"
              value={formData.targetMarket}
              onChange={(e) => setFormData(prev => ({ ...prev, targetMarket: e.target.value }))}
              placeholder="e.g., US Retail"
              maxLength={50}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-10"
              aria-label="Target Market"
              disabled={isLoading}
            />
            <div className="absolute inset-y-0 right-3 flex items-center">
              {getValidationIcon(validation.targetMarket)}
            </div>
          </div>
          <div className="flex justify-between items-center mt-1">
            {validation.targetMarket === false ? (
              <p className="text-red-600 text-sm">Use letters, numbers, and spaces only (1-50 characters)</p>
            ) : (
              <span className="text-gray-500 text-sm">
                {formData.targetMarket.length}/50 characters
              </span>
            )}
          </div>
        </div>

        {/* Mode Toggle */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">Analysis Mode</label>
          <div className="bg-gray-200 rounded-full p-1 relative">
            <div className="flex">
              <button
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, mode: 'Basic' }))}
                className={`flex-1 py-2 px-4 rounded-full text-sm font-medium transition-colors ${
                  formData.mode === 'Basic'
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
                disabled={isLoading}
              >
                Basic
              </button>
              <button
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, mode: 'Advanced' }))}
                className={`flex-1 py-2 px-4 rounded-full text-sm font-medium transition-colors ${
                  formData.mode === 'Advanced'
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
                disabled={isLoading}
              >
                Advanced
              </button>
            </div>
          </div>
          <p className="text-gray-500 text-xs mt-2">
            {formData.mode === 'Basic' ? 'Approachable explanations with term definitions' : 'Technical analysis with detailed metrics'}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-3">
          <button
            onClick={handleSubmit}
            disabled={!isFormValid || isLoading}
            className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            aria-label="Generate Audit"
          >
            {isLoading ? 'Generating...' : 'Generate CRO Audit'}
          </button>
          <button
            onClick={handleClear}
            disabled={isLoading}
            className="bg-gray-300 text-gray-800 py-2 px-4 rounded-md font-medium hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 disabled:opacity-50 transition-colors"
          >
            Clear
          </button>
        </div>
      </div>
    </div>
  );
};